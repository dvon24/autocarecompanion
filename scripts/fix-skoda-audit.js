#!/usr/bin/env node
/**
 * Apply audit findings to the 14 newly-added Skoda issues.
 *
 * Source: WebSearch verification round (2026-05-23). 9 entries verified
 * clean, 5 need fixes (none fabricated — all real issues, just need
 * year/scope/DTC tightening).
 *
 * Audit verdicts:
 *   ✓ skoda-octavia-tsi-timing-chain
 *   ✓ skoda-octavia-dsg-mechatronic
 *   ✓ skoda-octavia-tdi-egr-cooler
 *   ~ skoda-octavia-rear-bushings        — broaden scope
 *   ~ skoda-octavia-glove-box-damper     — soften 'almost every' claim
 *   ~ skoda-fabia-tsi-timing-chain       — tighten years to EA111 era
 *   ~ skoda-fabia-rear-axle-rust         — reframe to general rear corrosion
 *   ✓ skoda-superb-2.0-tdi-egr
 *   ✓ skoda-superb-water-pump
 *   ~ skoda-kodiaq-dsg-hesitation        — fix DTCs to DQ381 codes
 *   ✓ skoda-kodiaq-iv-battery
 *   ✓ skoda-enyaq-12v-drain
 *   ✓ skoda-enyaq-infotainment
 *   ✓ skoda-yeti-haldex-coupling
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

function yearsRange(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const UPDATES = [
  {
    id: 'skoda-fabia-tsi-timing-chain',
    note: 'Year range 2010-2018 too broad. EA111 1.2 TSI was largely replaced by EA211 around 2014 in Fabia Mk3 — EA211 does not have the tensioner defect. Tightening to 2010-2014.',
    fields: {
      years: yearsRange(2010, 2014),
    },
  },
  {
    id: 'skoda-kodiaq-dsg-hesitation',
    note: 'DTC codes P176B/P17D8/P189C are DQ200 (7-speed DRY-clutch) codes. Kodiaq uses DQ381 (7-speed WET-clutch) — correct codes are P1735 (Clutch 1 position sensor) and P1736 (Clutch 2 position sensor) per multiple specialist sources.',
    fields: {
      dtcCodes: ['P1735', 'P1736'],
    },
  },
  {
    id: 'skoda-octavia-glove-box-damper',
    note: 'Original description "Affects almost every Octavia after ~5 years" was overstated. Forums confirm common but not universal — some Mk3 Octavias operating fine at 9 years. Softening claim.',
    fields: {
      description: 'Common Octavia interior issue — the glove box damper can fail causing the glove box lid to drop open quickly when released, often spilling contents. Plastic damper internals wear and fluid leaks out. Common after 5+ years, though not universal — some owners report theirs working fine at 9 years. Cosmetic but irritating.',
    },
  },
  {
    id: 'skoda-octavia-rear-bushings',
    note: 'Original entry was too narrowly scoped to trailing arm bushings. Audit search confirmed multiple rear suspension components fail on Mk3 — rear multi-link bushings, ARB clamp bushes, rear wishbone bushes. Broadening scope.',
    fields: {
      title: 'Mk3 Rear Multi-Link Suspension Bushing Wear (Multiple Components)',
      description: 'Mk3 Octavia (and shared-platform Superb/Kodiaq) rear suspension bushings wear prematurely across multiple components: rear multi-link bushings, anti-roll bar (ARB) clamp bushes, and rear wishbone bushes. Symptoms include clunking noises over bumps, wandering at highway speeds, and accelerated rear tire wear (particularly inside edges). Wear typically appears at 50,000-80,000 mi. Worn ARB clamp bushes can let the collars hit the subframe due to elongated holes.',
      solution: 'Full rear suspension bushing refresh typically £450-£850 (~€500-€1,000 EU). Poly upgrade available for longer life. Wheel alignment required after replacement.',
    },
  },
  {
    id: 'skoda-fabia-rear-axle-rust',
    note: 'Original "rear beam axle" claim could not be specifically confirmed by audit. Search confirmed general suspension/subframe corrosion is a documented Fabia issue but not specifically "beam axle" — reframing to general rear suspension/subframe corrosion.',
    fields: {
      title: 'Rear Suspension and Subframe Corrosion (Mk1/Mk2 Salt-Belt)',
      description: 'Mk1 and Mk2 Fabias suffer rear suspension and subframe corrosion in salt-belt regions (Germany, UK, Scandinavia). The torsion beam/subframe rusts from the inside out, eventually compromising structural integrity. UK MOT testers have failed Fabias for rear suspension corrosion. Common at 8-15 years old in salt regions. The specific failure mode varies — could be beam, control arm mounts, or subframe.',
    },
  },
];

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Apply Skoda Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${UPDATES.length} entries (out of 14 audited)`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  const colMap = {
    title: 'title',
    description: 'description',
    solution: 'solution',
    severity: 'severity',
    years: 'years',
    dtcCodes: '"dtcCodes"',
  };

  let applied = 0;
  for (const u of UPDATES) {
    const before = (await pool.query(`SELECT id, status FROM "KnownIssue" WHERE id = $1`, [u.id])).rows[0];
    if (!before) { console.log(`  ✗ ${u.id} — not found`); continue; }
    console.log(`  ${APPLY ? '✓' : '·'} ${u.id}`);
    console.log(`    note: ${u.note.slice(0, 200)}${u.note.length > 200 ? '...' : ''}`);

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
    }
    applied++;
  }

  console.log(`\n${APPLY ? 'Applied' : 'Would apply'}: ${applied}`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
