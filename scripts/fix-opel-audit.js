#!/usr/bin/env node
/**
 * Apply audit findings to the 17 newly-added Opel pending_review entries.
 *
 * Audit done via WebSearch (2026-05-23) — same workflow that caught Skoda
 * issues. 10 verified clean, 7 need fixes. None fabricated — all real
 * issues with sourced confirmation, just needed scope tightening.
 *
 * Verdicts:
 *   ~ opel-astra-h-water-pump-z16xep         — Z16XEP water pump is AUX-belt-driven, not timing-belt
 *   ✓ opel-astra-j-1.7-cdti-egr-clog
 *   ~ opel-astra-1.4-turbo-timing-chain      — cold-start rattle has DMF distinction (TSB E-14-3157)
 *   ~ opel-astra-h-rear-axle-corrosion       — actually bush wear + mount corrosion, not beam-corrodes-from-inside
 *   ~ opel-corsa-d-handbrake-cable-corrosion — broader CSP mechanism issue + cable wear
 *   ~ opel-corsa-d-stretched-timing-chain-1.2-1.4 — 1.4 fails as early as 60k km, not 80k
 *   ~ opel-corsa-e-electric-power-steering   — soften "extended warranty" claim (not officially documented)
 *   ✓ opel-insignia-a-aisin-af40-shift-quality
 *   ✓ opel-insignia-a-2.0-cdti-egr-cooler-crack
 *   ✓ opel-insignia-a-flexpipe-exhaust-failure
 *   ✓ opel-zafira-b-fire-risk-heater-blower
 *   ✓ opel-zafira-c-1.6-cdti-egr-cooler
 *   ✓ opel-mokka-a-1.7-cdti-water-pump
 *   ✓ opel-vivaro-b-1.6-biturbo-timing-chain
 *   ✓ opel-crossland-1.2-puretech-oil-bath-belt
 *   ✓ opel-grandland-1.6-thp-timing-chain
 *   ~ opel-mokka-e-12v-battery-drain         — MyOpel app polling + AGM coding specifics confirmed
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
    id: 'opel-astra-h-water-pump-z16xep',
    note: 'Z16XEP 1.6 Twinport water pump is AUX-belt-driven (not timing belt — that is the 1.8 Z18XER). Removing the timing-belt-combo recommendation and tightening scope.',
    fields: {
      title: 'Astra H Water Pump Failure (Z16XEP Twinport / Z18XER 1.8)',
      description: 'Astra H (2004-2010) water pump failure is common between 60,000-130,000 km. The Z16XEP 1.6 Twinport drives its water pump from the AUX belt — leaks show first as coolant under the pulley side. The Z18XER 1.8 drives the pump from the timing belt — that pump must be replaced WITH the cambelt service. Both share plastic-impeller failure modes and often co-fail with the thermostat housing.',
      solution: 'Z16XEP: water pump replacement is a stand-alone job (€150-€300 incl. labor) once aux belt is off. Z18XER: do water pump AT the timing-belt service interval (~€400-€700 combined). Replace thermostat housing at the same time — same plastic-degradation issue.',
    },
  },
  {
    id: 'opel-astra-1.4-turbo-timing-chain',
    note: 'Cold-start rattle needs nuance — Vauxhall TSB E-14-3157 (2010-2014 A14NET) attributes brief startup rattle to dual-mass flywheel, not chain. Persistent rattle = chain. Without this distinction the entry sends owners to expensive chain jobs unnecessarily.',
    fields: {
      description: 'The A14NET 1.4 turbo engine in Astra J/K, Corsa D/E, Mokka A, and Adam can suffer timing chain stretch typically between 80,000-140,000 km. IMPORTANT DIAGNOSTIC DISTINCTION: brief (1-3 second) rattle ONLY on cold start is more often a worn dual-mass flywheel — see Vauxhall TSB E-14-3157 for 2010-2014 A14NET. Persistent rattle, misfire codes, or rattle that extends beyond cold start point to timing chain stretch. Chain skip causes valve-piston contact.',
      solution: 'Diagnose before replacing — TSB E-14-3157 DMF replacement (€700-€1,200) for startup-only rattle. Full timing chain kit (chain, tensioner, guides, sprockets) €900-€1,500 for persistent rattle / misfire codes. Catastrophic failure means engine rebuild (€4,000+). Use full-synthetic 5W-30 (dexos2) and stick to 10,000 km intervals.',
    },
  },
  {
    id: 'opel-astra-h-rear-axle-corrosion',
    note: 'Audit search showed the dominant Astra H rear-suspension MOT issue is rear axle bush wear + suspension mount corrosion, not "beam corrodes from inside out" (that framing is closer to Peugeot 206 / Renault Mégane). Reframing to actual documented failure modes.',
    fields: {
      title: 'Astra H Rear Axle Bush Wear + Suspension Mount Corrosion (Salt-Belt)',
      description: 'Astra H rear suspension fails MOT in two common ways: (1) rear axle bushes / trailing-arm-pivot bushes show excessive movement, and (2) suspension mount areas in the bodyshell corrode in salt-belt markets (UK, Germany, Scandinavia, US Northeast). Both typically present at 8+ years old. Bushes alone are a moderate repair; mount corrosion can be a write-off if the chassis section is rotted.',
      solution: 'Rear axle bush replacement: 3-4 hours labor, £175-£280 / €200-€350. Suspension mount corrosion repair: depends on extent — minor patch welds €200-€500, structural sections €600-€1,500. Inspect annually after age 8 in salt regions; underseal proactively at year 5.',
    },
  },
  {
    id: 'opel-corsa-d-handbrake-cable-corrosion',
    note: 'Reframing — the dominant Vauxhall Corsa D handbrake action was a customer satisfaction programme around the lever/mechanism design (release button could partially disengage if mis-applied). Cable wear/binding is a secondary issue. Original "corrosion" framing matched cable failures specifically but missed the bigger CSP.',
    fields: {
      title: 'Corsa D Handbrake — Lever Mechanism (CSP) + Cable Wear',
      description: 'Corsa D (2006-2014) has two related handbrake issues. (1) Lever-mechanism design: the release button could partially disengage the parking brake if the lever was applied incorrectly — Vauxhall ran a customer satisfaction programme offering a free modification. (2) Cable wear and binding: rear cables run under the car and suffer corrosion/seizing in salt regions, eventually failing MOT or refusing to release. Common at 6-10 years old.',
      solution: 'Check Vauxhall service-history records for the CSP modification — if not done, your dealer should still apply it free. Cable replacement €120-€280 incl. labor. Always test parking-brake hold on an incline periodically — failure can be sudden and silent.',
    },
  },
  {
    id: 'opel-corsa-d-stretched-timing-chain-1.2-1.4',
    note: 'Per AUTODOC and forum sources, 1.4 87hp shows symptoms as early as 60,000 km (not 80,000 like I originally wrote). 1.2 timeline 80,000-100,000 km. Tightening lower bound.',
    fields: {
      description: 'Naturally-aspirated 1.2 (Z12XEP/A12XER) and 1.4 (Z14XEP/A14XER) engines in Corsa D (and Adam) suffer timing chain stretch — distinct from the A14NET turbo issue. The 1.4 87hp shows first symptoms as early as 60,000-80,000 km; the 1.2 typically at 80,000-100,000 km. Root cause is tensioner bleed-off overnight + chain wear, worsened by long oil intervals or low-grade oil. Cold-start rattle (1-30 seconds) is the classic early sign.',
      typicalMileageLow: 60000,
    },
  },
  {
    id: 'opel-corsa-e-electric-power-steering',
    note: 'Could not confirm an official Vauxhall extended warranty for Corsa E EPS specifically (Corsa C/D had documented issues but not a formal warranty extension on Corsa E). Softening claim to "some warranty replacements" not "extended warranty program."',
    fields: {
      title: 'Corsa E Electric Power Steering Column Failure',
      description: 'Corsa E (2014-2019) EPS column motor / control unit can fail, causing sudden loss of power assistance. Some Vauxhall warranty replacements have been recorded but no formal market-wide warranty-extension programme. The pattern is well-documented on Corsa C and D and continues on E. Sudden assistance loss while moving is possible.',
      solution: 'Replacement steering column assembly is the standard fix (€600-€1,200 dealer; refurbishment specialists offer rebuild at €300-€500). Always check service-history records for any goodwill replacements at the dealer; some owners have had part-funded repairs as a goodwill gesture even outside formal warranty.',
      confidence: 'medium',
    },
  },
  {
    id: 'opel-mokka-e-12v-battery-drain',
    note: 'Audit confirmed the MyOpel app polling exacerbates parasitic drain (3-5 day reports), and AGM 12V replacement requires coding (~€290 dealer). Enhancing entry with these specifics.',
    fields: {
      description: 'Mokka-e (and closely related Corsa-e, Peugeot e-208, DS 3 Crossback E-Tense — all CMP/eCMP platform) drains the 12V AGM auxiliary battery during long parking spells, leaving the car unable to wake or charge. Owners report drain as fast as 3-5 days of inactivity. The MyOpel smartphone app polling the car wakes systems and accelerates drain. Stellantis acknowledged the issue and pushed multiple software updates between 2021-2024 — Opel recalled ~13,507 Corsa/Combo/Mokka in Germany alone for the traction battery control software.',
      solution: 'Update vehicle software to latest (dealer can check; some VINs covered by recall). Use a 12V battery maintainer for parked stretches over 1 week. Disable MyOpel remote polling if parking long-term. AGM 12V replacement needs coding — DIY is risky; dealer cost ~€290 (€150-€250 battery + €50-€100 fit/code).',
      estimatedCostHigh: 350,
    },
  },
];

const COL_MAP = {
  title: 'title',
  description: 'description',
  solution: 'solution',
  severity: 'severity',
  years: 'years',
  dtcCodes: '"dtcCodes"',
  confidence: 'confidence',
  estimatedCostLow: '"estimatedCostLow"',
  estimatedCostHigh: '"estimatedCostHigh"',
  typicalMileageLow: '"typicalMileageLow"',
  typicalMileageHigh: '"typicalMileageHigh"',
};

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Apply Opel Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${UPDATES.length} entries (out of 17 audited)`);
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
  console.log(`\nNext (after --apply): node scripts/publish-verified-issues.js --all-make Opel --apply`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
