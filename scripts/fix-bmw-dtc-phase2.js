#!/usr/bin/env node
/**
 * BMW Phase 2 — DTC mass-fix.
 *
 * Source: audit-bmw-1779438260052.json findings + audit-bmw-dtc-categories.json.
 *
 * Dominant pattern: P0401-P0404 (EGR codes) mass-applied to issues that have
 * nothing to do with EGR — brakes, transmissions, oil leaks, water pumps,
 * IBS recalls, even EVs (i3/i4/i5/i7/iX/Mach-E where EGR doesn't exist).
 *
 * Approach: category-based DTC corrections. Each category has a curated set
 * of CORRECT codes based on BMW's actual fault code conventions (BMW uses
 * manufacturer-specific hex codes like 2E81 for cooling, 4F40 for SMG, etc.
 * — NOT generic OBD-II P-codes for these systems).
 *
 * Usage:
 *   node scripts/fix-bmw-dtc-phase2.js              # dry-run
 *   node scripts/fix-bmw-dtc-phase2.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const cats = JSON.parse(fs.readFileSync('audit-bmw-dtc-categories.json', 'utf8'));

// Category-based DTC corrections.
// Each entry: { ids: [...], newDtcs: [...], reason: '...' }
const CATEGORY_FIXES = [
  {
    name: 'water_pump',
    ids: cats.water_pump,
    newDtcs: ['2E81', '2E82', '2E83', '2E84', '2E85', '377A'],
    reason: 'BMW electric water pump uses manufacturer hex codes 2E81 (speed deviation), 2E82 (cutoff/overcurrent), 2E83 (dry run / power reduced), 2E84 (communication), 2E85 (emergency operation), 377A. NOT generic P-codes like P0128/P2181 which are thermostat codes.',
  },
  {
    name: 'ibs_brake_recall',
    ids: cats.ibs_brake_recall,
    newDtcs: [],
    reason: 'IBS brake module faults use BMW chassis C-codes (model-specific), not P-codes. The previous P0401-P0404 EGR codes are completely wrong (brakes have nothing to do with EGR). Cleared DTC list rather than fabricate model-specific C-codes.',
  },
  {
    name: 'brake_only',
    ids: cats.brake_only,
    newDtcs: [],
    reason: 'Brake/ABS faults use BMW chassis C-codes (model-specific). Cleared rather than fabricate.',
  },
  {
    name: 'convertible_top',
    ids: cats.convertible_top,
    newDtcs: [],
    reason: 'Convertible top hydraulic faults use BMW body codes (CTM/FRM module, model-specific). Previous P0401-P0404 EGR codes were completely wrong. Cleared list.',
  },
  {
    name: 'rod_bearing',
    ids: cats.rod_bearing,
    newDtcs: [],
    reason: 'Rod bearing failure typically presents as rod knock with NO specific OBD-II code. Misfire codes (P0300-P030N) are not characteristic — they indicate ignition/fuel issues, not bottom-end wear. Cleared list to avoid misleading users.',
  },
  {
    name: 'software_idrive',
    ids: cats.software_idrive,
    newDtcs: [],
    reason: 'Infotainment/iDrive software issues use U-codes (communication faults) which are module-specific, not generic OBD-II codes. The previous P0401-P0404 EGR codes were wrong. Cleared list.',
  },
  {
    name: 'vanos_valvetronic',
    ids: cats.vanos_valvetronic,
    newDtcs: ['P1014', 'P1017', 'P1023', 'P1030', 'P10DF', 'P10E0', 'P10E1'],
    reason: 'VANOS/Valvetronic faults use these specific BMW codes (some appear as standard P-codes in BMW SI bulletins). BMW-specific hex codes like 135A08/135C11 also apply but the listed P-codes are universally recognized.',
  },
  {
    name: 'ev_battery',
    ids: cats.ev_battery,
    newDtcs: [],
    reason: 'EV high-voltage battery faults use BMW EV-specific hex codes that vary by model (i3/i4/iX use different code ranges). Cleared P0401-P0404 EGR codes which are impossible on a vehicle with no EGR system.',
  },
  {
    name: 'charging',
    ids: cats.charging,
    newDtcs: [],
    reason: 'EV charging faults use BMW EV-specific codes for the OBC (Onboard Charger) and HV system. Cleared P0401-P0404 EGR codes which are impossible on EVs.',
  },
  {
    name: 'oil_filter_housing',
    ids: cats.oil_filter_housing,
    newDtcs: ['P0521', 'P0522', 'P0524'],
    reason: 'Oil filter housing leaks cause low oil pressure (P0521/P0522/P0524 are oil pressure circuit codes). Generic OBD-II codes that apply across BMW engines.',
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  BMW Phase 2 DTC Mass-Fix (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let totalUpdated = 0;
  let totalSkipped = 0;
  for (const cat of CATEGORY_FIXES) {
    console.log(`━━━ ${cat.name} (${cat.ids.length} entries) ━━━`);
    console.log(`    new DTCs: ${cat.newDtcs.length ? JSON.stringify(cat.newDtcs) : '(empty — cleared)'}`);
    console.log(`    reason: ${cat.reason.slice(0, 200)}...`);

    for (const id of cat.ids) {
      const r = (await pool.query(
        `SELECT id, status, "dtcCodes" FROM "KnownIssue" WHERE id = $1`,
        [id],
      )).rows[0];
      if (!r) { console.log(`      ✗ ${id} — not found`); totalSkipped++; continue; }
      if (r.status !== 'published') { console.log(`      ~ ${id} — not published (${r.status})`); totalSkipped++; continue; }

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
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ${APPLY ? 'Updated' : 'Would update'}: ${totalUpdated}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
