#!/usr/bin/env node
/**
 * BMW Phase 2b — DTC fixes for remaining categories.
 *
 * Builds on fix-bmw-dtc-phase2.js (which handled 69 high-confidence
 * pattern fixes — water pump, brake, EV, convertible top, rod bearing,
 * VANOS, software, oil filter housing).
 *
 * This pass handles the remaining ~100 entries: transmission, carbon/
 * misfire, oil leak, turbo/wastegate, timing chain, suspension, hvac,
 * steering, electrical drain, and "other".
 *
 * Usage:
 *   node scripts/fix-bmw-dtc-phase2b.js              # dry-run
 *   node scripts/fix-bmw-dtc-phase2b.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');
const cats = JSON.parse(fs.readFileSync('audit-bmw-dtc-categories.json', 'utf8'));

const CATEGORY_FIXES = [
  {
    name: 'transmission',
    ids: cats.transmission,
    newDtcs: ['P0700', 'P0730', 'P0731', 'P0732', 'P0733', 'P0734', 'P0741'],
    reason: 'Standard automatic transmission codes covering TCM request (P0700), incorrect gear ratios (P0730-P0734), and torque converter clutch (P0741). For DCT/SMG, BMW also uses manufacturer hex codes (P17BF, P189C, 4F40-4FA0) but the listed P-codes are the recognized standard set.',
  },
  {
    name: 'carbon_misfire',
    ids: cats.carbon_misfire,
    newDtcs: ['P0300', 'P0171', 'P0174', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306'],
    reason: 'Carbon buildup on intake valves triggers random misfire (P0300), per-cylinder misfires (P0301-P0306 for I4/I6 BMWs), and lean fuel trims (P0171 bank 1 / P0174 bank 2 — bank 2 only applies to V engines, but included for completeness). HPFP and injector failures show similar pattern.',
  },
  {
    name: 'oil_leak',
    ids: cats.oil_leak,
    newDtcs: [],
    reason: 'Oil leaks from valve covers, oil filter housings, or seals typically DO NOT throw OBD-II codes directly. Secondary effects may trigger P052E (PCV) or misfires (P030x from oil-contaminated coils), but no characteristic primary code. Cleared list to avoid misleading users.',
  },
  {
    name: 'turbo_wastegate',
    ids: cats.turbo_wastegate,
    newDtcs: ['P0234', 'P0299', 'P0245', 'P0243'],
    reason: 'Standard turbocharger fault codes: P0234 (overboost), P0299 (underboost / wastegate stuck open), P0245 (boost control solenoid low), P0243 (boost solenoid). BMW also uses hex codes 30FF/30FE for boost solenoid issues but these P-codes are the universal set.',
  },
  {
    name: 'timing_chain',
    ids: cats.timing_chain,
    newDtcs: ['P0011', 'P0014', 'P0016', 'P0017'],
    reason: 'Timing chain stretch causes camshaft/crankshaft correlation faults: P0011 (intake cam advance), P0014 (exhaust cam advance), P0016 (bank 1 correlation), P0017 (bank 1 exhaust correlation). For M3/M4 S55 crank hub slip, BMW also has hex codes 130E20/130F20 but the standard P-codes are widely recognized.',
  },
  {
    name: 'suspension',
    ids: cats.suspension,
    newDtcs: [],
    reason: 'Suspension issues split into two camps: (a) mechanical wear (bushings, struts, wheel bearings, ball joints) usually has NO DTC — diagnosed by inspection / road test; (b) air suspension faults use BMW chassis C-codes (model-specific like C1525). Cleared list since previous P-codes were either wrong (P0401-P0404 EGR codes on suspension entries) or generic.',
  },
  {
    name: 'hvac_ac',
    ids: cats.hvac_ac,
    newDtcs: ['P0530', 'P0532', 'P0533'],
    reason: 'A/C refrigerant pressure circuit codes (P0530 sensor circuit, P0532 low, P0533 high) cover compressor failure and refrigerant loss patterns. Blend door issues use B-codes (body, model-specific) which are not generalizable.',
  },
  {
    name: 'steering',
    ids: cats.steering,
    newDtcs: [],
    reason: 'EPS (Electric Power Steering) faults use BMW chassis C-codes (model-specific). The relevant US recall is 14V-153 for assist loss. Cleared list since previous codes were generic and EPS C-codes vary by chassis.',
  },
  {
    name: 'electrical_drain',
    ids: cats.electrical_drain,
    newDtcs: [],
    reason: 'Parasitic battery drain typically has NO specific OBD-II code — diagnosed by current draw test. Module communication issues throw U-codes (module-specific).',
  },
  {
    name: 'other',
    ids: cats.other,
    newDtcs: [],
    reason: 'Entries in this miscellaneous bucket are too varied for a single DTC pattern (could be sunroof, paint, recall scope, etc.). Cleared list rather than fabricate codes — better to have empty DTCs than wrong ones.',
  },
  // emissions_egr (1 entry) intentionally skipped — P0401-P0404 IS correct for actual EGR issues
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  BMW Phase 2b — Remaining DTC Categories (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let totalUpdated = 0;
  let totalSkipped = 0;
  for (const cat of CATEGORY_FIXES) {
    console.log(`━━━ ${cat.name} (${cat.ids.length} entries) ━━━`);
    console.log(`    new DTCs: ${cat.newDtcs.length ? JSON.stringify(cat.newDtcs) : '(empty — cleared)'}`);

    for (const id of cat.ids) {
      const r = (await pool.query(
        `SELECT id, status FROM "KnownIssue" WHERE id = $1`,
        [id],
      )).rows[0];
      if (!r) { totalSkipped++; continue; }
      if (r.status !== 'published') { totalSkipped++; continue; }

      if (APPLY) {
        await pool.query(
          `UPDATE "KnownIssue" SET "dtcCodes" = $1, "updatedAt" = NOW() WHERE id = $2`,
          [cat.newDtcs, id],
        );
        totalUpdated++;
      } else {
        totalUpdated++;
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  ${APPLY ? 'Updated' : 'Would update'}: ${totalUpdated}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
