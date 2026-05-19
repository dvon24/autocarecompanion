#!/usr/bin/env node
/**
 * Apply the May 19 Mercedes-Benz AMG GT model audit findings.
 *
 * AMG GT is the #1 mover in this week's GSC trending data (+3), so this
 * runs ahead of the broader Mercedes-Benz audit to clean the page Google
 * is actively surfacing.
 *
 * 9 → 4 published: 5 archived + 3 fixed in place + 1 parse-error retained
 * pending re-audit.
 *
 * Notable hallucination pattern: 5 of 9 entries fabricated, mostly via
 * cross-platform bleed — issues from W203/W209/W210/W211 era sedans
 * (subframe bushings, anti-glare coating) copied to the AMG GT (C190/C192).
 * Real M178 oil leak hotspots are valve cover gaskets, oil filter housing,
 * turbo oil feed lines (NHTSA 19V587), and rear main seal — NOT the
 * "scavenge line leak" we had.
 *
 * Usage:
 *   node scripts/fix-amg-gt-audit.js              # dry-run
 *   node scripts/fix-amg-gt-audit.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const ARCHIVE_IDS = [
  // ─── Fabricated / no documented evidence (3) ───
  'mercedes-amg-gt-screen-delamination-2016',        // anti-glare delam is W203/W209/R171 era, not C190
  'mercedes-amg-gt-rear-subframe-bushing-2016',      // subframe bushing wear is W210/W211/W124/W140
  'mercedes-benz-amggt-front-passenger-air-bag-2024', // no OCS recall on C192; described pattern is older platforms
  // ─── Wrong-vehicle majors (2) ───
  'mercedes-amg-gt-dry-sump-oil-leak-2016',          // real M178 leaks are valve cover / oil filter housing / turbo feed line (19V587) / RMS — not scavenge return lines. Description so misattributed a rewrite would be a new entry.
  'mercedes-benz-amggt-intermittent-brake-warning--2024', // no documented C192 brake-assist pattern; DTCs (C003A/C0031/C0500) are generic OBD-II not the Mercedes manufacturer-specific C-code format
];

const UPDATES = [
  {
    id: 'mercedes-amg-gt-transmission-mount-failure-2016',
    note: 'C190 AMG GT uses three ACTIVE (electronically controlled) transaxle mounts — not passive hydraulic. Real-world failure mode is wiring harness / connector connectivity faults that trigger dash errors, not heat-induced rubber deterioration. Cost was understated for active OEM parts + rear-of-vehicle labor.',
    fields: {
      title: 'Active Transaxle Mount Connectivity Faults and Replacement',
      description: "The C190 AMG GT mounts its rear transaxle on three ACTIVE (electronically controlled) mounts that stiffen under hard cornering and soften at idle. The most common reported failure isn't rubber breakdown — it's wiring harness or connector corrosion at the mount sensors, which trips dash warnings (\"Suspension malfunction\" / \"Engine/transmission mount fault\") and forces the mounts into a default-soft state. The fix is usually harness cleaning or connector replacement; full mount replacement is uncommon but expensive when needed (active mounts are pricey OEM parts and labor at the rear of the car is significant). The original entry incorrectly described these as passive hydraulic mounts.",
      estimatedCostLow: 400,
      estimatedCostHigh: 2800,
    },
  },
  {
    id: 'mercedes-benz-amggt-12v-battery-drain-and-2024',
    note: 'No C192 AMG GT-specific TSB/NHTSA — pattern is documented on platform-mates (W206 C-Class TSB LI54.10-P-076820, EQE/EQS 24V-372) and applies by analogy. Lowering severity to "low" since most cases are nuisance-level (warning messages) rather than stranding; tightening DTC claim and noting platform-wide nature.',
    fields: {
      severity: 'low',
      title: '12V Battery Drain from Telematics / Sleep-Mode Module Wakes (Platform-Wide Pattern)',
      description: "Mercedes' current electronic architecture (shared across the C192 AMG GT, W206 C-Class, X254 GLC, and EQE/EQS) has documented 12V battery drain complaints from control modules not sleeping properly — typically the telematics / mbrace head unit polling cellular at idle. On the AMG GT specifically, there's no model-specific TSB yet, but the same root cause applies: cars left parked for 1-2+ weeks may need a jump-start, and battery management warnings can appear on the cluster. The W206 has a TSB (LI54.10-P-076820); EQE/EQS got a 2024 software recall (24V-372). Typical remedy on AMG GT is a software update at the dealer or, if the battery has been damaged by repeated deep discharge, replacement (~$400-600 for the AGM unit). Most cases are nuisance-level; severity downgraded from medium to low for that reason.",
      dtcCodes: [],
      estimatedCostLow: 0,
      estimatedCostHigh: 700,
    },
  },
  {
    id: 'mercedes-benz-amggt-mbux-instrument-cluster-2024',
    note: 'Real recall: NHTSA campaign issued 2026-05-08 covering 144,049 vehicles across 2024-2026 MY (AMG GT, C-Class, E-Class, SL, CLE, GLC) for infotainment control unit software causing digital cluster blackouts while driving. Must add 2026 to years, bump to high severity (NHTSA classified as safety recall), drop cost ceiling (free OTA/dealer software update), tighten DTC claim.',
    fields: {
      years: [2024, 2025, 2026],
      severity: 'high',
      title: 'MBUX Instrument Cluster Blackout / Reboot While Driving (NHTSA Recall, May 2026)',
      description: "An infotainment control unit software defect in 2024-2026 AMG GT (and shared across the C-Class, E-Class, SL, CLE, and GLC on the same platform) can trigger system resets that briefly black out the digital instrument cluster while the vehicle is in motion — hiding speed, warnings, and gear position for several seconds. Mercedes-Benz issued an NHTSA recall covering 144,049 vehicles on May 8, 2026, classifying the defect as safety-critical due to the elevated crash risk during a cluster blackout. The remedy is a free software update at the dealer (or OTA where supported). Owners typically notice MBUX freezes or full reboots while driving before the cluster blanking event; the two symptoms share the same root cause.",
      dtcCodes: [],
      estimatedCostLow: 0,
      estimatedCostHigh: 0,
    },
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Mercedes-Benz AMG GT Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`━━━ Archive ${ARCHIVE_IDS.length} issues ━━━`);
  for (const id of ARCHIVE_IDS) {
    const r = (await pool.query(`SELECT id, make, model, title, status FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
    if (!r) { console.log(`  ✗ ${id} — not found`); continue; }
    if (r.status === 'archived') { console.log(`  ~ ${id} — already archived`); continue; }
    console.log(`  ${APPLY ? '✓' : '·'} ${id} — "${r.title.slice(0, 70)}"`);
    if (APPLY) {
      await pool.query(`UPDATE "KnownIssue" SET status = 'archived', "updatedAt" = NOW() WHERE id = $1`, [id]);
    }
  }

  console.log(`\n━━━ Update ${UPDATES.length} issues ━━━`);
  const colMap = {
    title: 'title',
    description: 'description',
    solution: 'solution',
    severity: 'severity',
    years: 'years',
    trims: 'trims',
    dtcCodes: '"dtcCodes"',
    estimatedCostLow: '"estimatedCostLow"',
    estimatedCostHigh: '"estimatedCostHigh"',
    typicalMileageLow: '"typicalMileageLow"',
    typicalMileageHigh: '"typicalMileageHigh"',
  };
  for (const u of UPDATES) {
    const before = (await pool.query(
      `SELECT id, title, years, severity, "dtcCodes", "estimatedCostLow", "estimatedCostHigh" FROM "KnownIssue" WHERE id = $1`,
      [u.id],
    )).rows[0];
    if (!before) { console.log(`  ✗ ${u.id} — not found`); continue; }
    console.log(`\n  ${u.id}`);
    console.log(`    note: ${u.note}`);
    for (const [k, v] of Object.entries(u.fields)) {
      const oldVal = before[k] === undefined ? 'undefined' : JSON.stringify(before[k]);
      const newVal = JSON.stringify(v);
      console.log(`    ${k}:`);
      console.log(`      - ${oldVal.slice(0, 100)}${oldVal.length > 100 ? '...' : ''}`);
      console.log(`      + ${newVal.slice(0, 100)}${newVal.length > 100 ? '...' : ''}`);
    }
    if (APPLY) {
      const sets = [];
      const params = [];
      let i = 1;
      for (const [k, v] of Object.entries(u.fields)) {
        const col = colMap[k];
        if (!col) continue;
        params.push(v);
        sets.push(`${col} = $${i++}`);
      }
      sets.push(`"updatedAt" = NOW()`);
      params.push(u.id);
      await pool.query(`UPDATE "KnownIssue" SET ${sets.join(', ')} WHERE id = $${i}`, params);
      console.log(`    ✓ applied`);
    }
  }

  await pool.end();
  console.log(`\n${APPLY ? 'Done.' : '(dry-run — re-run with --apply to write)'}`);
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
