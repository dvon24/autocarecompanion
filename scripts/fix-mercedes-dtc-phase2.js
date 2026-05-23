#!/usr/bin/env node
/**
 * Mercedes-Benz Phase 2 — DTC mass-fix.
 *
 * Source: audit-mercedes-dtc-categories.json (64 published Mercedes-Benz
 * entries with DTC issues).
 *
 * Usage:
 *   node scripts/fix-mercedes-dtc-phase2.js              # dry-run
 *   node scripts/fix-mercedes-dtc-phase2.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');
const cats = JSON.parse(fs.readFileSync('audit-mercedes-dtc-categories.json', 'utf8'));

const CATEGORY_FIXES = [
  {
    name: 'air_suspension',
    ids: cats.air_suspension,
    newDtcs: [],
    reason: 'Mercedes AIRMATIC faults use chassis C-codes (model-specific: C1132-C1135 level sensors, C152x range, plus various B-codes). Too varied for a single safe DTC set. Cleared.',
  },
  {
    name: 'abc_hydraulic',
    ids: cats.abc_hydraulic,
    newDtcs: [],
    reason: 'Mercedes ABC (Active Body Control) hydraulic faults use SBC/SLS module C-codes that vary by chassis. Cleared.',
  },
  {
    name: 'airmatic_compressor',
    ids: cats.airmatic_compressor,
    newDtcs: [],
    reason: 'AIRMATIC compressor C-codes are chassis-specific. C1525 (compressor fill time exceeded) appears but varies. Cleared.',
  },
  {
    name: 'isg_48v',
    ids: cats.isg_48v,
    newDtcs: ['P0A0F', 'P0A1A', 'P0B2900', 'P0CA700'],
    reason: 'Mercedes 48V ISG (Integrated Starter Generator) codes match Audi BSG pattern: P0A0F (hybrid powertrain), P0A1A (generator control module), P0B2900 (hybrid battery), P0CA700 (hybrid battery discharge).',
  },
  {
    name: 'transmission_7g_9g',
    ids: cats.transmission_7g_9g,
    newDtcs: ['P0700', 'P0730', 'P0731', 'P0732', 'P0741'],
    reason: '7G-Tronic / 9G-Tronic standard transmission codes. Mercedes also has manufacturer hex codes for valve body issues.',
  },
  {
    name: 'dct_shudder',
    ids: cats.dct_shudder,
    newDtcs: ['P073C', 'P073D', 'P073E', 'P073F'],
    reason: 'Mercedes 7G-DCT (724.0) is WET-clutch DCT. Mercedes-specific DCT shudder codes per documentation. NOT P0725 (engine speed sensor) which was incorrectly listed before.',
  },
  {
    name: 'm272_m271_balance_shaft',
    ids: cats.m272_m271_balance_shaft,
    newDtcs: ['P0016', 'P0017'],
    reason: 'M272/M271 balance shaft wear causes camshaft-crankshaft correlation faults: P0016 (Bank 1 sensor A), P0017 (Bank 1 sensor B). The mechanical wear itself does not throw codes until correlation drift triggers.',
  },
  {
    name: 'timing_chain_variator',
    ids: cats.timing_chain_variator,
    newDtcs: ['P0011', 'P0014', 'P0016', 'P0017'],
    reason: 'M276/M278 timing chain variator/stretch codes: cam advance and correlation.',
  },
  {
    name: 'diesel_injector',
    ids: cats.diesel_injector,
    newDtcs: ['P0201', 'P0202', 'P0203', 'P0204'],
    reason: 'OM651/OM654 diesel injector circuit codes per cylinder.',
  },
  {
    name: 'diesel_dpf_def',
    ids: cats.diesel_dpf_def,
    newDtcs: ['P207F', 'P20EE', 'P229F', 'P2002'],
    reason: 'Sprinter/CDI DEF/AdBlue + DPF codes: P207F (reductant quality), P20EE (NOx catalyst), P229F (NOx sensor), P2002 (DPF efficiency).',
  },
  {
    name: 'diesel_glow_plug',
    ids: cats.diesel_glow_plug,
    newDtcs: ['P0671', 'P0672', 'P0673', 'P0674'],
    reason: 'Glow plug cylinder-specific circuit codes. Standard across diesel engines.',
  },
  {
    name: 'comand_mbux',
    ids: cats.comand_mbux,
    newDtcs: [],
    reason: 'COMAND / MBUX infotainment + instrument cluster faults use U-codes (communication) and manufacturer-specific codes via XENTRY/STAR. No standard OBD-II P-code applies. Cleared.',
  },
  {
    name: 'sam_module',
    ids: cats.sam_module,
    newDtcs: [],
    reason: 'SAM module faults use chassis B/U-codes. Cleared.',
  },
  {
    name: 'battery_drain_12v',
    ids: cats.battery_drain_12v,
    newDtcs: [],
    reason: 'Parasitic 12V drain typically has no specific OBD-II code — diagnosed by current draw test. Cleared.',
  },
  {
    name: 'battery_drain_48v',
    ids: cats.battery_drain_48v,
    newDtcs: ['B183349', 'B183371', 'B183384', 'B183319'],
    reason: 'Mercedes 48V battery control module B-codes per documentation: B183349, B183371, B183384, B183319.',
  },
  {
    name: 'rear_axle_steering',
    ids: cats.rear_axle_steering,
    newDtcs: [],
    reason: 'Rear-axle steering faults use chassis C-codes that vary by platform. Generic C1500 listed previously is not a recognized Mercedes code. Cleared.',
  },
  {
    name: 'convertible_top',
    ids: cats.convertible_top,
    newDtcs: [],
    reason: 'Convertible top hydraulic / latch faults use body codes (CTM module) — not standard P-codes. Cleared.',
  },
  {
    name: 'transfer_case',
    ids: cats.transfer_case,
    newDtcs: [],
    reason: '4MATIC transfer case codes are chassis/transfer case module specific. Cleared.',
  },
  {
    name: 'led_headlight',
    ids: cats.led_headlight,
    newDtcs: [],
    reason: 'LED headlight ballast/control module faults use B-codes. Cleared.',
  },
  {
    name: 'brake',
    ids: cats.brake,
    newDtcs: [],
    reason: 'Brake squeal / premature wear typically has no DTC — mechanical/material issue. Cleared.',
  },
  {
    name: 'pcv',
    ids: cats.pcv,
    newDtcs: ['P052E', 'P052E71'],
    reason: 'PCV regulator valve performance codes. P052E is the standard SLC / M-engine code. P052E71 is a related Mercedes-specific subcode.',
  },
  {
    name: 'suspension',
    ids: cats.suspension,
    newDtcs: [],
    reason: 'Mechanical suspension noise typically has no DTC. Cleared.',
  },
  {
    name: 'driver_assist',
    ids: cats.driver_assist,
    newDtcs: [],
    reason: 'Driver assistance sensor misalignment uses module-specific codes. Cleared.',
  },
  {
    name: 'airbag_ocs',
    ids: cats.airbag_ocs,
    newDtcs: ['B1022F0'],
    reason: 'Mercedes OCS (Occupant Classification System) / PODS fault code per Audi documentation. B1022F0 covers passenger airbag disabling from OCS fault.',
  },
  {
    name: 'ev_range',
    ids: cats.ev_range,
    newDtcs: [],
    reason: 'EV range degradation is a measured behavior, not a DTC. Cleared.',
  },
  {
    name: 'turbo',
    ids: cats.turbo,
    newDtcs: ['P0299', 'P0234'],
    reason: 'Turbo resonator crack / boost leak codes: P0299 (underboost), P0234 (overboost).',
  },
  {
    name: 'other',
    ids: cats.other,
    newDtcs: [],
    reason: 'Mixed bucket. Cleared to avoid fabricating codes.',
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Mercedes-Benz Phase 2 DTC Fix (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let totalUpdated = 0;
  for (const cat of CATEGORY_FIXES) {
    console.log(`━━━ ${cat.name} (${cat.ids.length}) — new: ${cat.newDtcs.length ? JSON.stringify(cat.newDtcs) : '(cleared)'}`);
    for (const id of cat.ids) {
      const r = (await pool.query(`SELECT status FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
      if (!r || r.status !== 'published') continue;
      if (APPLY) {
        await pool.query(`UPDATE "KnownIssue" SET "dtcCodes" = $1, "updatedAt" = NOW() WHERE id = $2`, [cat.newDtcs, id]);
      }
      totalUpdated++;
    }
  }
  console.log(`\n${APPLY ? 'Updated' : 'Would update'}: ${totalUpdated}`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
