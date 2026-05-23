#!/usr/bin/env node
/**
 * Apply audit findings to the 12 newly-added Pontiac pending_review entries.
 *
 * Audit via WebSearch (2026-05-23).
 * 9 verified clean, 3 needed corrections — including one entry where I
 * confused two Toyota engines (the famous 2AZ-FE 2.4L oil-burning issue
 * vs the 1ZZ-FE 1.8L which has its own different oil-consumption issue).
 *
 * Verdicts:
 *   ✓ pontiac-bonneville-3800-lim-gasket
 *   ✓ pontiac-grand-prix-3800-lim-gasket
 *   ~ pontiac-g6-2.4-timing-chain-leda      — soften the "GM PI0808/SCA" claim (couldn't verify those exact numbers; "11340C" applies to 3.6L V6, not 2.4L Ecotec)
 *   ✓ pontiac-solstice-trunk-leak
 *   ✓ pontiac-gto-rear-tire-rub-2005-2006
 *   ✓ pontiac-g8-fuel-pump-recall
 *   ~ pontiac-aztek-intermediate-steering-shaft  — ENHANCE: add 2003 NHTSA recall for undersize intermediate shaft (real, distinct from generic clunk TSB)
 *   ~ pontiac-vibe-1zz-oil-consumption       — WRONG ENGINE FRAMING: famous Toyota oil-burning lawsuit is 2AZ-FE 2.4L, NOT 1ZZ-FE 1.8L. Vibe 1.8 has its own coked-rings issue but no Toyota class-action coverage extended to Pontiac. Rewriting.
 *   ✓ pontiac-grand-am-3.4l-intake-gasket
 *   ✓ pontiac-firebird-lt1-optispark
 *   ✓ pontiac-sunfire-2.2-ecotec-head-gasket
 *   ✓ pontiac-montana-3.4l-intake-gasket
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

function range(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const UPDATES = [
  {
    id: 'pontiac-g6-2.4-timing-chain-leda',
    note: 'I claimed "GM eventually issued PI0808 / Special Coverage Adjustment covering an extension of warranty" — but the well-documented GM SCA for premature timing chain (11340C) actually applies to the 3.6L V6, NOT the 2.4L Ecotec LE5. I could not confirm a specific Pontiac G6 LE5 warranty extension. Softening the claim — the engineering issue is real and very well documented, but the GM-extended-warranty hook is overstated.',
    fields: {
      description: 'The 2.4L Ecotec LE5 in 2007-2010 G6 (and shared Cobalt SS, Malibu, HHR, Saturn Aura/Ion, Solstice) develops timing chain stretch — a very well-documented engineering issue across Ecotec forums and independent shops. Root cause: GM\'s original Oil Life Monitor allowed intervals up to 12,000 miles, starving the chain. Note: while GM issued Special Coverage Adjustment 11340C covering timing chain stretch on the 3.6L LFX/LLT V6, the 2.4L Ecotec did NOT receive the same blanket warranty extension. Some owners obtained goodwill repairs through dealer-level escalation.',
      solution: 'Full timing chain kit replacement (chain, tensioner, guides) ~$1,200-$2,000. If you experience the issue under 100,000 miles, request a goodwill-assistance review at a GM/Chevy dealer (not all approved, but some are). Use dexos1 full-synthetic 5W-30 and stick to 5,000-mile intervals going forward.',
    },
  },
  {
    id: 'pontiac-aztek-intermediate-steering-shaft',
    note: 'Beyond the general TSB clunk issue I described, GM ALSO issued a 2003 NHTSA recall for certain 2003 Aztek + Rendezvous with an undersize intermediate shaft that could spin inside the column coupling — full loss of directional control possible. Enhancing entry to capture both the recall (rare, 2003 only) and the general clunk (long-term, many years).',
    fields: {
      title: 'Aztek/Rendezvous Intermediate Steering Shaft — 2003 Recall + General Clunk Issue',
      description: '2001-2005 Aztek and 2002-2005 Buick Rendezvous (GMT257 platform) have two related intermediate-steering-shaft issues. (1) NHTSA recall for certain 2003-model Aztek and Rendezvous (Product Field Action Bulletin 03009) — an undersize intermediate shaft can spin inside the steering-column coupling, causing total loss of directional control with no prior warning. (2) Across all years: the intermediate-shaft splines dry out and develop a pronounced clunk when turning the wheel or going over bumps. Not a safety issue once recall remedy is in place, but very noticeable.',
      solution: 'Recall: check VIN at NHTSA — affected 2003 cars get free shaft replacement. General clunk: disassemble the intermediate shaft, clean and re-lube splines with synthetic grease (DIY) or pay ~$80 shop labor. If splines are visibly worn, replace the shaft ($150-$300 part). GM "shaft lube kit" with snap-in collar is a durable fix.',
      severity: 'medium',
      confidence: 'high',
    },
  },
  {
    id: 'pontiac-vibe-1zz-oil-consumption',
    note: 'Major correction. I confused two engines: the famous Toyota class-action over oil consumption is on the 2AZ-FE 2.4L (covers some Vibe years too — 2009+ 2.4L). The 1ZZ-FE 1.8L has its OWN documented oil-consumption issue (coked oil control rings) but was NOT part of the Toyota class action or warranty extension. My original entry mixed the two and falsely claimed GM-Toyota cross-coverage. Rewriting to honestly distinguish the two engines and remove the cross-coverage claim.',
    fields: {
      years: range(2003, 2008),
      title: 'Vibe 1.8L (1ZZ-FE) Oil Consumption — Coked Piston Rings',
      description: '2003-2008 Pontiac Vibe (and Toyota Matrix/Corolla — all NUMMI-built) with the 1.8L 1ZZ-FE engine commonly develops excessive oil consumption (often 1 qt per 1,000 miles or worse) due to stuck/coked piston oil-control rings. Note: this engine was NOT covered by the well-known Toyota oil-consumption class-action lawsuit — that case (settled in 2014/2015 with warranty extension ZE7 through Oct 2016) applied to the 2.4L 2AZ-FE engine (used in 2009+ Vibe 2.4 and many Toyota models). The 1ZZ-FE issue is well-documented but never received GM or Toyota corporate coverage.',
      solution: 'Top-end engine cleaner (BG EPR, AMSOIL Engine and Transmission Flush) cycled through oil changes can sometimes free stuck rings. Failing that, piston-ring replacement (~$1,800-$3,000) or full short-block swap (~$3,000-$4,500). Monitor oil level weekly until consumption rate is known. Switching to a high-mileage oil (Mobil 1 High Mileage 5W-30) sometimes slows the rate of consumption.',
      confidence: 'high',
    },
  },
];

const COL_MAP = {
  title: 'title',
  description: 'description',
  solution: 'solution',
  severity: 'severity',
  years: 'years',
  trims: 'trims',
  dtcCodes: '"dtcCodes"',
  confidence: 'confidence',
  estimatedCostLow: '"estimatedCostLow"',
  estimatedCostHigh: '"estimatedCostHigh"',
  typicalMileageLow: '"typicalMileageLow"',
  typicalMileageHigh: '"typicalMileageHigh"',
};

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Apply Pontiac Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${UPDATES.length} entries (out of 12 audited)`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  let applied = 0;
  for (const u of UPDATES) {
    const before = (await pool.query(`SELECT id, status FROM "KnownIssue" WHERE id = $1`, [u.id])).rows[0];
    if (!before) { console.log(`  ✗ ${u.id} — not found`); continue; }
    console.log(`  ${APPLY ? '✓' : '·'} ${u.id}  [${before.status}]`);
    console.log(`    note: ${u.note.slice(0, 200)}${u.note.length > 200 ? '...' : ''}`);

    if (APPLY) {
      const sets = [];
      const params = [];
      let i = 1;
      for (const [k, v] of Object.entries(u.fields)) {
        const col = COL_MAP[k];
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
  console.log(`\nNext (after --apply): node scripts/publish-verified-issues.js --all-make Pontiac --apply`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
