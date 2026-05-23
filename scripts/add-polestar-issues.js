#!/usr/bin/env node
/**
 * Add Polestar known issues via audit-before-publish gate.
 * Polestar shares Volvo platforms — many issues mirror Volvo XC40
 * Recharge / Volvo EX30 / Volvo EX90 patterns.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const ISSUES = [
  {
    id: 'polestar-2-inverter-recall-22v-029',
    make: 'Polestar', model: 'Polestar 2', years: range(2020, 2022),
    trims: ['Long Range Single Motor', 'Long Range Dual Motor', 'Performance Pack', 'Launch Edition'],
    engines: ['Single Motor', 'Dual Motor'],
    category: 'drivetrain',
    title: 'Polestar 2 Front Inverter Recall (22V-029) — Sudden Power Loss',
    description: 'NHTSA recall 22V-029 covered ~4,586 Polestar 2 vehicles for a high-voltage inverter that could fail and cause a sudden loss of propulsion. Polestar issued the recall in January 2022. Failure mode is sudden, with little warning, and leaves the car without drive — potential safety risk in traffic.',
    solution: 'Free recall remedy at Polestar Space (service center) — inverter inspection and replacement as needed. Confirm VIN against 22V-029. If you experience sudden loss of acceleration, pull over safely and contact Polestar.',
    severity: 'critical', confidence: 'high',
    symptoms: ['sudden loss of power', 'cannot accelerate', 'inverter fault'],
    affectedSystems: ['inverter', 'drivetrain'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
  {
    id: 'polestar-2-bms-recall-23v-101',
    make: 'Polestar', model: 'Polestar 2', years: range(2020, 2022),
    trims: ['Long Range Single Motor', 'Long Range Dual Motor', 'Performance Pack'],
    engines: ['Single Motor', 'Dual Motor'],
    category: 'electrical',
    title: 'Polestar 2 BMS Software Recall — Charge Limit Mis-Reporting',
    description: 'Polestar issued multiple software recalls for the battery management system (BMS) in early Polestar 2 cars — symptoms varied but included incorrect state-of-charge display, premature regen disable, and charging session terminating early. NHTSA recall 23V-101 (and earlier software actions) addressed several variants.',
    solution: 'Software update via OTA addresses most BMS recalls. Verify your VIN is current on recalls at Polestar Space or via NHTSA lookup. If charge level is suspect, plug in to an L2 charger and let the car re-baseline.',
    severity: 'high', confidence: 'high',
    symptoms: ['wrong SOC display', 'regen disabled', 'charge session ends early'],
    affectedSystems: ['BMS', 'HV battery', 'charging'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
  {
    id: 'polestar-2-12v-drain',
    make: 'Polestar', model: 'Polestar 2', years: range(2020, 2024),
    trims: ['Long Range Single Motor', 'Long Range Dual Motor', 'Performance Pack', 'Standard Range Single Motor'],
    engines: ['all'],
    category: 'electrical',
    title: 'Polestar 2 12V Auxiliary Battery Drain',
    description: 'Polestar 2 reports 12V auxiliary battery drain during long parking, particularly when "Always-on Connectivity" features (Polestar app + remote diagnostics) are enabled. Pattern shared with sister Volvo XC40 Recharge. Multiple software updates have improved parasitic draw.',
    solution: 'Update software via OTA or Polestar Space. Use a 12V battery maintainer for storage stretches over 2 weeks. AGM 12V replacement under warranty for documented failures; out-of-warranty €180-€280 + coding.',
    severity: 'medium', confidence: 'high',
    symptoms: ['will not wake', 'dead 12V', 'app shows offline'],
    affectedSystems: ['12V battery', 'BCM'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 350,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
  {
    id: 'polestar-2-android-automotive-bugs',
    make: 'Polestar', model: 'Polestar 2', years: range(2020, 2024),
    trims: ['all'],
    engines: ['all'],
    category: 'electrical',
    title: 'Polestar 2 Android Automotive Infotainment Bugs',
    description: 'Polestar 2 was the first car to launch with Google\'s Android Automotive OS native (not Android Auto projection). Owners report glitches: Google Maps freezes, Spotify audio drops, Assistant unresponsive, voice commands ignored, app crashes after OTA. Most resolve with later software, but pattern is ongoing.',
    solution: 'Apply latest OTA. Hard-reset: hold both lower-corner buttons of center screen for 20 seconds. Persistent issues may need a "system reset" at Polestar Space (does not erase saved profile).',
    severity: 'low', confidence: 'high',
    symptoms: ['Google Maps freezes', 'Spotify drops', 'Assistant unresponsive', 'app crashes'],
    affectedSystems: ['infotainment', 'Android Automotive'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 100000,
  },
  {
    id: 'polestar-2-charge-port-stuck',
    make: 'Polestar', model: 'Polestar 2', years: range(2020, 2024),
    trims: ['Long Range Single Motor', 'Long Range Dual Motor', 'Performance Pack'],
    engines: ['all'],
    category: 'electrical',
    title: 'Polestar 2 Charge Port Door Stuck / Latch Failure',
    description: 'Polestar 2 charge port door — operated by the small button on the door — can stick, particularly in cold weather or after debris collection in the latch mechanism. Some VINs received TSB action for revised latch hardware.',
    solution: 'Emergency release procedure documented in owner manual (manual cable behind sidewall trim in cargo area). Replacement latch assembly $200-$400 + install. Polestar Space covers under warranty for documented failures.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['charge port wont open', 'charge port stuck', 'latch fail'],
    affectedSystems: ['charge port', 'door latch'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 600,
    typicalMileageLow: 10000, typicalMileageHigh: 80000,
  },
  {
    id: 'polestar-2-hv-coolant-heater',
    make: 'Polestar', model: 'Polestar 2', years: range(2021, 2022),
    trims: ['Long Range Single Motor', 'Long Range Dual Motor'],
    engines: ['all'],
    category: 'hvac',
    title: 'Polestar 2 HV Coolant Heater (PTC) Failure',
    description: 'Pre-heat-pump Polestar 2 (2021-2022, before the 2023+ heat pump option) used a PTC resistive HV coolant heater that has documented failure cases — symptoms include no cabin heat, charging-related thermal warnings, and reduced winter range. Polestar covers under warranty.',
    solution: 'Schedule Polestar Space inspection — PTC heater replacement under warranty (8 yr / 100,000 mi for HV components). Heat-pump option from 2023+ is the durable fix; some 2021-2022 owners qualify for heat-pump retrofit (region-dependent).',
    severity: 'medium', confidence: 'medium',
    symptoms: ['no heat', 'thermal warning', 'reduced winter range'],
    affectedSystems: ['PTC heater', 'thermal management'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 5000, typicalMileageHigh: 60000,
  },
  {
    id: 'polestar-1-charging-issues',
    make: 'Polestar', model: 'Polestar 1', years: range(2019, 2021),
    trims: ['Base'],
    engines: ['PHEV'],
    category: 'electrical',
    title: 'Polestar 1 PHEV Charging Issues / OBC Faults',
    description: 'The limited-production Polestar 1 PHEV (~1,500 units total) has documented On-Board Charger (OBC) faults — refusing to start a charging session, terminating mid-session, or reporting wrong charge rate. Parts availability for this niche model is also a documented owner pain point.',
    solution: 'Polestar Space service is the only option for OBC repairs — limited Polestar 1 parts availability means some repairs take weeks. Out-of-warranty OBC replacement is expensive ($2,500-$4,500 + install). Plan ahead for parts lead time.',
    severity: 'high', confidence: 'low',
    symptoms: ['will not start charging', 'session terminates', 'wrong charge rate'],
    affectedSystems: ['OBC', 'charging system'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 5000,
    typicalMileageLow: 10000, typicalMileageHigh: 80000,
  },
  {
    id: 'polestar-3-first-year-delivery-quality',
    make: 'Polestar', model: 'Polestar 3', years: range(2023, 2024),
    trims: ['Long Range Single Motor', 'Long Range Dual Motor', 'Performance Pack', 'Launch Edition'],
    engines: ['Single Motor', 'Dual Motor'],
    category: 'electrical',
    title: 'Polestar 3 Early-Production Delivery + Quality Issues',
    description: 'Polestar 3 had a delayed launch (originally 2023, pushed to late 2024 for US deliveries) due to software readiness issues with the Core compute platform. Early-production cars report infotainment glitches, OTA challenges, and various trim/quality issues typical of a new model launch. Polestar issued multiple over-the-air updates in the first six months.',
    solution: 'Stay current on OTA — the Polestar 3 receives frequent updates. Document delivery-quality issues in writing with Polestar Space within 90 days for goodwill correction. Most first-year quality issues are covered under bumper-to-bumper warranty (4 yr / 50,000 mi).',
    severity: 'medium', confidence: 'low',
    symptoms: ['infotainment glitches', 'OTA fails', 'delivery quality issues'],
    affectedSystems: ['infotainment', 'Core compute', 'fit and finish'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    typicalMileageLow: 0, typicalMileageHigh: 30000,
  },
];

async function main() {
  console.log(`\n  Polestar — inserting ${ISSUES.length} drafts as pending_review\n`);
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
