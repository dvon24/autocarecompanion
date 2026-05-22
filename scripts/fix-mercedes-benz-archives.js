#!/usr/bin/env node
/**
 * Apply the May 22 Mercedes-Benz remainder audit findings (Phase 1: archives only).
 *
 * Source: audit-mercedes-benz-1779438177996.json (Opus 4.7 + web_search,
 * 147-issue audit, excluding AMG GT which was cleaned in task #113).
 *
 * Phase 1 archives 8 fabricated + 9 wrong-vehicle/wrong-engine majors.
 * Fix-in-place candidates (87 minors + 12 recoverable majors) deferred
 * to Phase 2. One Mercedes-AMG GT entry from our own prior fix needs
 * a corrective re-fix (transaxle mount is passive hydraulic, not active
 * electronic as claimed) — handled separately in Phase 2.
 *
 * Notable Mercedes-specific hallucination patterns:
 *   - 7G-DCT "dry clutch" claim on CLA/GLA — it's wet-clutch; dry-clutch
 *     DCT is the Ford/Renault 7DCT250, not Mercedes.
 *   - EQ-series EV entries with technical impossibilities (OLED backlight
 *     bleed, "strut mounts" on air-suspension cars) and cross-manufacturer
 *     DTC copying (Land Rover/Toyota codes on EQE SUV AIRMATIC entry).
 *   - Wrong-engine attribution: A-Class M282/M260, E-Class M271/M274,
 *     CLS M264/M270 — confused which engine the model uses in the US.
 *   - Cross-platform bleed: GLK transfer case "actuator" copied from
 *     BMW xDrive (GLK 4MATIC has mechanical AWD).
 *   - Wrong recall scope: E-Class brake hose (recall is S-Class only),
 *     E-Class sunroof bonding (recall is 2003-2009 W211, not 2021+).
 *
 * Usage:
 *   node scripts/fix-mercedes-benz-archives.js              # dry-run
 *   node scripts/fix-mercedes-benz-archives.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const ARCHIVE_IDS = [
  // ═══════════════════════════════════════════════════════════
  // FABRICATED (8) — Opus 4.7 + web_search found no real-world evidence
  // ═══════════════════════════════════════════════════════════

  // ── Cross-platform bleed (3) ──
  'mercedes-glc-m274-turbo-coolant-line-2016',          // crimp coolant leak is Chevy Cruze 1.4T / Audi, not Mercedes M274
  'mercedes-glk-class-transfer-case-actuator-2010',     // GLK 4MATIC has mechanical AWD (45:55 split), no actuator — copied from BMW xDrive
  'mercedes-eqe-suspension-noise-bumps-2023',           // EQE uses Airmatic air suspension, not strut mounts with rubber bushings

  // ── Technical impossibility / EV hallucinations (2) ──
  'mercedes-eqs-hyperscreen-delamination-2022',         // OLED panels can't have backlight bleed (no backlight)
  'mercedes-eqs-suv-hyperscreen-ghost-touches-2023',    // No documented EQS SUV ghost-touch pattern

  // ── Wrong vehicle scope / wrong recall (3) ──
  'mercedes-metris-diesel-injector-leak-2016',          // US Metris was never sold with a diesel engine
  'mercedes-benz-e-class-front-brake-hose-may-2021',    // Recall 25V-116 covers S-Class (223) only — no E-Class
  'mercedes-benz-e-class-panoramic-sunroof-glass-bonding-2021', // Sunroof bonding recall is 2003-2009 W211, not 2021+ E-Class

  // ═══════════════════════════════════════════════════════════
  // MAJORS THAT CAN'T BE SALVAGED (9) — wrong-engine, wrong-vehicle,
  // or fundamental misattribution where a rewrite would amount to a
  // new entry. Fix-in-place candidates deferred to Phase 2.
  // ═══════════════════════════════════════════════════════════

  // ── Wrong engine for the listed model/trim (4) ──
  'mercedes-c-class-m271-timing-chain-tensioner-2008',  // C300 never used M271 in US (M272/M276 V6); M271 was C250 2012-2015 only
  'mercedes-a-class-m282-turbo-wastegate-rattle-2019',  // A220 uses M260 2.0L, not M282 1.3L
  'mercedes-e-class-m274-turbo-oil-line-leak-2014',     // Banjo bolt leak is M271 (W204), not M274 (W213)
  'mercedes-benz-cls-class-m264-20l-engine-stalling-2019', // P052E crankcase issue is M270/M274, not M264

  // ── Wrong clutch/transmission mechanism (2) ──
  'mercedes-cla-dct-transmission-shudder-2014',         // 7G-DCT is wet-clutch, not dry — DTCs also wrong
  'mercedes-gla-dct-shudder-2015',                      // Same wet/dry clutch confusion

  // ── Wrong vehicle for issue cluster (3) ──
  'mercedes-gle-tailgate-wiring-harness-2016',          // Hinge harness fatigue is C/E/S/GLC pattern, not GLE
  'mercedes-benz-slc-nox-sensor-check-engine-light-on-slc-43', // NOx sensor is diesel/SCR — SLC 43 is gasoline twin-turbo V6
  'mercedes-benz-sl-class-mbuxinstrument-cluster-software-glitc-2022', // Year range wrong (recall covers 2026 only) and overlaps the AMG GT MBUX entry we already cleaned
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Mercedes-Benz Audit Archives — Phase 1 (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${ARCHIVE_IDS.length} issues`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let archived = 0, alreadyArchived = 0, notFound = 0, failed = 0;
  const byCategory = {};

  for (const id of ARCHIVE_IDS) {
    const r = (await pool.query(
      `SELECT id, model, title, status FROM "KnownIssue" WHERE id = $1`,
      [id],
    )).rows[0];
    if (!r) { console.log(`  ✗ ${id} — not found`); notFound++; continue; }
    if (r.status === 'archived') { console.log(`  ~ ${id} — already archived`); alreadyArchived++; continue; }
    byCategory[r.model] = (byCategory[r.model] || 0) + 1;
    console.log(`  ${APPLY ? '✓' : '·'} [${r.model.padEnd(20)}] ${id}`);
    console.log(`      "${r.title.slice(0, 80)}"`);
    if (APPLY) {
      try {
        await pool.query(`UPDATE "KnownIssue" SET status = 'archived', "updatedAt" = NOW() WHERE id = $1`, [id]);
        archived++;
      } catch (err) {
        console.log(`    ✗ DB error: ${err.message.slice(0, 200)}`);
        failed++;
      }
    } else {
      archived++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Archived${APPLY ? '' : ' (would archive)'}: ${archived}`);
  console.log(`  Already archived:  ${alreadyArchived}`);
  console.log(`  Not found:         ${notFound}`);
  console.log(`  Failed:            ${failed}`);
  console.log('  By model:');
  for (const [model, c] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${model.padEnd(20)} ${c}`);
  }
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
