#!/usr/bin/env node
/**
 * Apply the May 14 Acura audit findings to the DB.
 *
 * Two operations:
 *   ARCHIVE 13 issues (status='archived' so /known-issues/* pages 404
 *     them cleanly): 9 entries Opus 4.7 could not find any real-world
 *     evidence for + 4 entries where the described issue is for a
 *     different generation / engine / system than the row claims.
 *
 *   UPDATE 6 issues with targeted corrections: severity calibration,
 *     wrong year ranges (DCT/9-speed introductions), terminology
 *     mismatches (SH-AWD "transfer case" vs "torque transfer unit"),
 *     and a wrong-direction title (oil consumption → oil dilution).
 *
 * Findings sourced from scripts/audit-issues-sample.js run on 2026-05-14
 * (audit-acura-1778776528859.json). Minors left alone — calibration
 * drift but real issues; not worth manual time.
 *
 * Usage:
 *   node scripts/fix-acura-audit.js              # dry-run
 *   node scripts/fix-acura-audit.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const ARCHIVE_IDS = [
  // 9 fabricated — Opus 4.7 + web_search could not find documented
  // evidence these issues exist for the listed vehicles.
  'acura-integra-cvt-hesitation-2023',
  'acura-tsx-power-steering-pump-whine-2009', // TSX uses EPS, no hydraulic pump
  'acura-tlx-type-s-turbo-oil-line-leak-2021',
  'acura-mdx-oil-dilution-20t-2022', // oil dilution is on 1.5T (Civic/CR-V), not 3.0L TT
  'acura-nsx-12v-battery-drain-2017', // 1st-gen NSX issue copied to 2nd gen
  'acura-rlx-suspension-bushing-wear-2014',
  'acura-rlx-shawd-rear-motor-noise-2014',
  'acura-nsx-hybrid-system-warning-2017',
  'acura-nsx-9speed-dct-shudder-2017',
  // 4 majors where the described issue doesn't match the listed years/vehicle.
  // Archiving rather than rewriting since the IDs are baked into the years
  // they target, and the right fix would be a separate new row via the
  // hardened v2 research pipeline.
  'acura-mdx-shawd-rear-diff-whine-2007', // actual issue is torque converter (TSB 12-029)
  'acura-ilx-ac-compressor-failure-2013', // no widespread evidence
  'acura-rl-navigation-system-failure-2005', // HDD nav was 1st-gen RL 1996-2004; 2nd gen uses DVD
  'acura-tl-handsfreelink-bluetooth-module-parasitic-2009', // HFL drain is 3rd-gen TL 2004-2008
];

const UPDATES = [
  {
    id: 'acura-tl-dashboard-crack-2004',
    note: 'Severity under-calibrated — cracks at HVAC vents above airbags create deployment risk in hot climates.',
    fields: { severity: 'medium' },
  },
  {
    id: 'acura-mdx-torque-converter-shudder-2014',
    note: 'ZF 9-speed was introduced on 2016 MDX. 2014-2015 used Honda 6-speed (separate issue). Tightening years to 9-speed era.',
    fields: {
      years: [2016, 2017, 2018, 2019, 2020],
      title: 'ZF 9-Speed Automatic Transmission Shudder and Harsh Shifting',
    },
  },
  {
    id: 'acura-ilx-dct-shudder-2013',
    note: '8-speed DCT was introduced on 2016 ILX. 2013-2015 ILX used 6-speed manual / 5-speed auto. Fixing year range to DCT era.',
    fields: {
      years: [2016, 2017, 2018, 2019, 2020, 2021, 2022],
      title: '8-Speed DCT Shudder and Low-Speed Jerking',
    },
  },
  {
    id: 'acura-rdx-turbo-oil-consumption-2019',
    note: 'The documented issue is oil DILUTION (fuel mixing into oil, level rises) — not consumption. Inverting the framing.',
    fields: {
      title: '2.0T Engine Oil Dilution from Direct Injection Fuel Wash',
      description: "The 2.0L K20C4 turbo in the 3rd-gen RDX is documented to suffer oil DILUTION rather than consumption — unburned fuel from direct injection washes past the rings during cold-start cycles (especially short trips in cold climates) and accumulates in the crankcase. Owners typically see the oil level RISE above the full mark, with a strong gasoline smell on the dipstick. Long-term, the diluted oil loses film strength and accelerates bearing/cam wear. Acura issued software calibration updates under TSB 22-039 to reduce cold-start enrichment time.",
    },
  },
  {
    id: 'acura-rl-shawd-system-noise-2005',
    note: '2nd-gen RL SH-AWD uses a transverse FWD transaxle with a torque transfer unit + rear differential containing electromagnetic clutches — there is no traditional transfer case.',
    fields: {
      title: 'SH-AWD Torque Transfer Unit / Rear Differential Clutch Noise',
      description: "The 2nd-gen RL's Super Handling All-Wheel Drive uses a torque transfer unit (TTU) at the transaxle output plus a rear differential containing electromagnetic clutch packs for variable side-to-side torque distribution. With age and fluid breakdown, both can develop a low-speed grinding or moaning noise — most often the rear unit's electromagnetic clutches when SH-AWD fluid is contaminated or below spec.",
    },
  },
  {
    id: 'acura-tlx-brake-noise-aspec-2018',
    note: '2nd-gen TLX (with the Type S trim that has 4-piston Brembo fronts) launched for the 2021 model year — Type S did not exist on the 1st-gen 2015-2020 platform. Tightening year range.',
    fields: {
      years: [2021, 2022, 2023, 2024, 2025],
      title: 'Type S Brembo Front Brake Squeal and Premature Pad Wear',
    },
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Acura Audit Fix Application (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // ARCHIVES
  console.log(`━━━ Archive ${ARCHIVE_IDS.length} issues ━━━`);
  for (const id of ARCHIVE_IDS) {
    const r = (await pool.query(`SELECT id, title, status FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
    if (!r) {
      console.log(`  ✗ ${id} — not found`);
      continue;
    }
    if (r.status === 'archived') {
      console.log(`  ~ ${id} — already archived`);
      continue;
    }
    console.log(`  ${APPLY ? '✓' : '·'} ${id} (${r.title.slice(0, 60)})`);
    if (APPLY) {
      await pool.query(
        `UPDATE "KnownIssue" SET status = 'archived', "updatedAt" = NOW() WHERE id = $1`,
        [id],
      );
    }
  }

  // UPDATES
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
      `SELECT id, title, years, severity, description FROM "KnownIssue" WHERE id = $1`,
      [u.id],
    )).rows[0];
    if (!before) {
      console.log(`  ✗ ${u.id} — not found`);
      continue;
    }
    console.log(`\n  ${u.id}`);
    console.log(`    note: ${u.note}`);
    for (const [k, v] of Object.entries(u.fields)) {
      const oldVal = JSON.stringify(before[k]);
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
