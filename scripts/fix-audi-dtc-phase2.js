#!/usr/bin/env node
/**
 * Audi Phase 2 — DTC mass-fix.
 *
 * Source: audit-audi-dtc-categories.json (131 published Audi entries
 * with DTC issues flagged by the audit).
 *
 * Same approach as BMW Phase 2: category-based correction with curated
 * DTC sets per issue type.
 *
 * Usage:
 *   node scripts/fix-audi-dtc-phase2.js              # dry-run
 *   node scripts/fix-audi-dtc-phase2.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');
const cats = JSON.parse(fs.readFileSync('audit-audi-dtc-categories.json', 'utf8'));

const CATEGORY_FIXES = [
  {
    name: 'water_pump',
    ids: cats.water_pump,
    newDtcs: ['P261A', 'P261B', 'P261C', 'P261D', 'P0128'],
    reason: 'Audi electric coolant pump B control circuit codes (P261A-P261D). P0128 covers thermostat-below-regulating-temp as a related symptom.',
  },
  {
    name: 'thermostat',
    ids: cats.thermostat,
    newDtcs: ['P0128', 'P0597', 'P0598', 'P0599'],
    reason: 'Thermostat housing fault codes: P0128 (below regulating temp), P0597 (heater control circuit), P0598 (heater control low), P0599 (heater control high).',
  },
  {
    name: 'coolant_leak',
    ids: cats.coolant_leak,
    newDtcs: ['P0128', 'P0480'],
    reason: 'Coolant leaks typically trigger low-coolant warnings rather than specific DTCs. P0128 and P0480 (cooling fan) cover related symptoms.',
  },
  {
    name: 'air_suspension',
    ids: cats.air_suspension,
    newDtcs: [],
    reason: 'Audi air suspension faults use chassis C-codes that are model-specific (e.g., C1046 plausibility, C1xxx range level sensor codes, function shut-off codes). Cleared rather than fabricate generic codes that do not exist.',
  },
  {
    name: 'mechatronic_dsg',
    ids: cats.mechatronic_dsg,
    newDtcs: ['P176B', 'P17D6', 'P17D7', 'P17D8', 'P174F', 'P17E1'],
    reason: 'Documented DL501/DQ381 S-Tronic mechatronic codes per owner forums + Audi TSBs. Removed P0741 (torque converter clutch) which does NOT apply to dual-clutch transmissions.',
  },
  {
    name: 'transmission',
    ids: cats.transmission,
    newDtcs: ['P0700', 'P0730', 'P0731', 'P0732', 'P0741'],
    reason: 'Standard transmission codes: P0700 (TCM request), P0730 (incorrect gear ratio), P0731-P0732 (specific gear ratios), P0741 (TCC stuck off — Tiptronic only, NOT applicable to DSG/DCT).',
  },
  {
    name: 'vanos_timing_chain',
    ids: cats.vanos_timing_chain,
    newDtcs: ['P0011', 'P0014', 'P0016', 'P0017'],
    reason: 'Timing chain stretch / VVT issues trigger cam-crank correlation codes P0011/P0014/P0016/P0017. Removed P0012 (over-retard) which is more commonly an oil control valve issue than chain stretch.',
  },
  {
    name: 'carbon_misfire',
    ids: cats.carbon_misfire,
    newDtcs: ['P0300', 'P0171', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306'],
    reason: 'Carbon buildup triggers random misfire (P0300), per-cylinder misfires (P0301-P0306 covers I4/I6 — Audi V8s would need P0307-P0308 added per-entry, but the inline-engine pattern is the universal default), and lean fuel trims (P0171 bank 1; P0174 bank 2 only on V engines). Removed bank-2 codes from default since most Audi engines listed are inline.',
  },
  {
    name: 'hpfp_injector',
    ids: cats.hpfp_injector,
    newDtcs: ['P0087', 'P0088', 'P0089'],
    reason: 'High-pressure fuel pump codes: P0087 (low fuel pressure), P0088 (high), P0089 (regulator performance). These match Audi 2.0T HPFP / cam follower wear patterns.',
  },
  {
    name: 'oil_leak',
    ids: cats.oil_leak,
    newDtcs: [],
    reason: 'Oil leaks (valve cover, rear main seal, oil pan) typically DO NOT throw OBD-II codes. Secondary effects may trigger P052E (PCV regulator) but no primary code is characteristic. Cleared.',
  },
  {
    name: 'turbo_wastegate',
    ids: cats.turbo_wastegate,
    newDtcs: ['P0234', 'P0299', 'P0245', 'P0243'],
    reason: 'Turbocharger fault codes: P0234 (overboost), P0299 (underboost / wastegate stuck open), P0245 (boost control solenoid low), P0243 (boost solenoid circuit). Universal pattern across Audi turbos (1.8T, 2.0T, 2.7T, 4.0T, 4.2T).',
  },
  {
    name: 'mhev_48v',
    ids: cats.mhev_48v,
    newDtcs: ['P0A0F', 'P0A1A', 'P0B2900', 'P0CA700', 'U046900'],
    reason: 'Audi 48V mild-hybrid BSG (Belt Starter Generator) codes: P0A0F (hybrid powertrain), P0A1A (generator control module), P0B2900 (hybrid battery), P0CA700 (hybrid battery discharge), U046900 (starter/generator implausible signal). Per Audi TSBs and owner forum diagnostics.',
  },
  {
    name: 'diesel_dpf',
    ids: cats.diesel_dpf,
    newDtcs: ['P2002', 'P244A', 'P246C'],
    reason: 'DPF clogging codes. P2002 (Bank 1 only — Audi 2.0L TDI is inline-4 single-bank, so P2003 Bank 2 does NOT apply). P244A (DPF differential pressure), P246C (DPF restriction).',
  },
  {
    name: 'diesel_injector',
    ids: cats.diesel_injector,
    newDtcs: ['P0201', 'P0202', 'P0203', 'P0204'],
    reason: 'Diesel injector circuit codes per cylinder (TDI 4-cyl). Replaces incorrect P0300/P0301 misfire codes which are gasoline-engine codes.',
  },
  {
    name: 'diesel_emissions',
    ids: cats.diesel_emissions,
    newDtcs: [],
    reason: 'Dieselgate defeat device specifically did NOT set DTCs by design — it cheated emissions tests without triggering codes. Cleared list since any P-codes would imply the cheat triggered codes (it did not).',
  },
  {
    name: 'brake',
    ids: cats.brake,
    newDtcs: [],
    reason: 'Audi brake/EPB faults use chassis C-codes (model-specific). Cleared rather than fabricate.',
  },
  {
    name: 'adaptive_cruise_radar',
    ids: cats.adaptive_cruise_radar,
    newDtcs: ['C110BF0', 'C110B49', 'C1103'],
    reason: 'Audi ACC radar codes per Audi TSB: C110BF0 (restricted sensor view — bumper damage / debris), C110B49 (internal electronic failure), C1103 (misadjusted ACC).',
  },
  {
    name: 'mmi_infotainment',
    ids: cats.mmi_infotainment,
    newDtcs: [],
    reason: 'MMI faults use U-codes (communication, module-specific) and B-codes (body). No standard OBD-II P-code applies. Cleared to avoid showing wrong codes.',
  },
  {
    name: 'electrical_drain',
    ids: cats.electrical_drain,
    newDtcs: [],
    reason: 'Parasitic battery drain has no specific OBD-II code — diagnosed via current draw test. Cleared.',
  },
  {
    name: 'suspension_clunk',
    ids: cats.suspension_clunk,
    newDtcs: [],
    reason: 'Mechanical suspension wear (bushings, ball joints, wheel bearings) has no characteristic DTC — diagnosed by inspection. Cleared.',
  },
  {
    name: 'hvac_ac',
    ids: cats.hvac_ac,
    newDtcs: ['P0530', 'P0532', 'P0533'],
    reason: 'A/C refrigerant pressure sensor codes covering compressor failure and refrigerant loss patterns.',
  },
  {
    name: 'other',
    ids: cats.other,
    newDtcs: [],
    reason: 'Mixed bucket too varied for a single DTC pattern. Cleared rather than fabricate — empty DTCs are better than wrong ones. Per-entry fixes can be applied later if specific issues need codes.',
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Audi Phase 2 DTC Mass-Fix (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let totalUpdated = 0, totalSkipped = 0;
  for (const cat of CATEGORY_FIXES) {
    console.log(`━━━ ${cat.name} (${cat.ids.length}) — new: ${cat.newDtcs.length ? JSON.stringify(cat.newDtcs) : '(cleared)'}`);
    for (const id of cat.ids) {
      const r = (await pool.query(`SELECT status FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
      if (!r || r.status !== 'published') { totalSkipped++; continue; }
      if (APPLY) {
        await pool.query(`UPDATE "KnownIssue" SET "dtcCodes" = $1, "updatedAt" = NOW() WHERE id = $2`, [cat.newDtcs, id]);
      }
      totalUpdated++;
    }
  }

  console.log(`\n${APPLY ? 'Updated' : 'Would update'}: ${totalUpdated}, Skipped: ${totalSkipped}`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
