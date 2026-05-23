#!/usr/bin/env node
/**
 * Apply audit findings to the 42 newly-added Suzuki/SEAT/Dacia/CUPRA entries.
 *
 * Audited via WebSearch (~16 parallel queries). 34 verified clean, 8 need
 * corrections. None fabricated outright — all real issue patterns, but
 * some had wrong DTCs, soft scopes, or speculative claims that needed
 * tightening.
 *
 * Apply with --apply.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const UPDATES = [
  {
    id: 'cupra-formentor-2.0-tsi-ea888-gen4-chain',
    note: 'Gen 4 chain issues are not yet documented (engine too new — Formentor launched 2020). Reframing to known Gen 3-pattern HPFP tappet noise + monitor stance. The well-known Gen 1/2 chain saga was fixed by Gen 3 (2012); Gen 4 (used in Formentor) inherits Gen 3 architecture. Honest scope reduction.',
    fields: {
      title: 'Formentor 2.0 TSI HPFP Tappet Noise + Cold-Start Rattle Monitoring',
      description: 'The 2.0 TSI in Formentor (EA888 Gen 3/4) is too new for definitive long-term failure patterns, but inherits two monitorable behaviors from earlier generations. (1) High-pressure fuel pump tappet noise — a ticking sound at idle that\'s annoying but not failure-prone (pump can be shimmed or replaced if intrusive). (2) Cold-start rattle should clear within 1-2 seconds; persistent rattle warrants chain inspection (Gen 1/2 chain-stretch issues were notionally addressed by Gen 3 in 2012, but cold-start rattles are still occasionally reported).',
      solution: 'HPFP tappet shim or pump replacement €350-€650. If chain rattle persists, dealer diagnostic is recommended before any €1,200-€2,500 chain replacement. Use VW 504.00 oil at 10,000 km max — extended-life intervals shorten chain life on this family.',
      severity: 'medium',
      confidence: 'low',
    },
  },
  {
    id: 'cupra-born-12v-infotainment-glitches',
    note: 'CUPRA Born / VW ID.3 software versions go 2.4, 3.0, 3.1, 3.2 — software 4.0 is only for future ICAS3-based vehicles (ID.7, ID.2, next-gen ID.3). Current MEB cars cannot get 4.0. Correcting version range.',
    fields: {
      description: 'The Born (MEB platform, shared with VW ID.3/ID.4/Cupra Tavascan) has documented 12V auxiliary battery drain plus MIB3 infotainment glitches: screen freezes, system reboots while driving, slow voice response, intermittent CarPlay/Android Auto, rear-camera dropout, ambient lighting glitches. VW Group rolled multiple software releases (2.4 → 3.0 → 3.1 → 3.2) addressing different subsets. Software 4.0 is NOT coming to current MEB cars — only future ICAS3 vehicles (ID.7, ID.2, next-gen ID.3) will receive it.',
    },
  },
  {
    id: 'seat-mii-electric-12v-drain',
    note: 'The Mii Electric / VW e-Up / Skoda Citigo e iV recall was for HV battery cells (fire risk), not 12V drain — only 213 vehicles globally were affected by the HV cell recall. 12V drain is a documented forum issue but does NOT have a formal VW Group recall. Clarifying.',
    fields: {
      description: 'The Mii Electric (and twin VW e-Up, Skoda Citigo-e iV) suffers from 12V auxiliary battery drain during long parking, documented in owner forums but not subject to a formal VW Group recall for this specific issue. A separate HV battery cell recall did affect a small number of these cars (213 globally) over fire risk — distinct from the 12V issue. The 12V drain is the more common complaint.',
      confidence: 'medium',
    },
  },
  {
    id: 'seat-alhambra-tailgate-struts',
    note: 'Web search did not surface widespread "Alhambra tailgate strut failure" as a reported issue beyond generic gas-strut wear pattern. Softening confidence and reframing as generic age-related wear rather than a SEAT-specific defect.',
    fields: {
      description: 'Like most heavy-tailgate vehicles, the 2010-2020 Alhambra Mk2 (and twin VW Sharan) tailgate gas struts gradually weaken with age — typically 4-6 years to the point where the heavy tailgate either fails to stay up or slowly closes on fingers. Generic age/UV/temperature wear rather than a SEAT-specific defect. The electric-tailgate variant requires the strut+motor module assembly together, which raises repair cost significantly.',
      confidence: 'low',
    },
  },
  {
    id: 'suzuki-vitara-1.4-boosterjet-oil-dilution',
    note: 'Suzuki changed factory oil spec from 5W-30 to 0W-20 in the 2022 facelift K14D update (and also bumped to API SP for LSPI protection). This is critical info for owners — affects oil purchase. Adding to solution.',
    fields: {
      description: 'The 1.4 BoosterJet K14C in Vitara and S-Cross can suffer oil-level dilution from fuel washing past piston rings during short, cold-engine trips — fuel enters the sump faster than evaporation removes it. Oil level rising above max on the dipstick is the warning sign. Common in cars used mostly for sub-15-minute commutes. Suzuki updated the factory oil spec from 5W-30 (API SN) to 0W-20 (API SP) in the 2022 K14D facelift partly to address this; pre-2022 K14C should use API SP-spec 5W-30 even though the original handbook lists API SN.',
      solution: 'Check oil monthly — note any rise above max. Take a 30-minute fully-warmed-up drive weekly to boil off fuel. Persistent dilution means oil change every 5,000 km not 10,000. Pre-2022 K14C: use API SP-rated 5W-30 (better than original SN spec). 2022+ K14D: use 0W-20 API SP per updated Suzuki spec. Severe dilution (oil level rising 5mm+) warrants injector leakage or piston-ring inspection.',
    },
  },
  {
    id: 'suzuki-grand-vitara-n32a-timing-chain',
    note: 'Search showed the dominant N32A 3.2 V6 issue is "timing chain cover gasket + tensioner" (RepairPal: 94 reports), not chain stretch specifically. Reframing.',
    fields: {
      title: 'Grand Vitara 3.2 V6 N32A Timing Chain Cover Gasket + Tensioner Issues',
      description: 'The 3.2 N32A V6 (GM-developed, used in Grand Vitara 2009-2015 and XL-7) is most reported for timing chain COVER GASKET leaks + tensioner wear — not pure chain stretch (94 reports on RepairPal). Symptoms: oil leak from front of engine, rattle on cold start, eventual chain tension loss. Multiple chains (intake/exhaust banks + oil pump drive) compound the parts cost when the whole assembly needs service.',
      solution: 'Cover gasket + tensioner refresh €600-€1,000. Full multi-chain kit (chains, tensioners, guides) €1,500-€2,800. Use 5W-30 dexos1 spec, stick to 8,000 km intervals. Severe chain skip means valve damage and rebuild.',
      estimatedCostLow: 600,
      estimatedCostHigh: 4000,
    },
  },
  {
    id: 'suzuki-across-rav4-phev-12v-drain',
    note: 'Audit surfaced specific Toyota TSB numbers — T-SB-0021-20 (covers 2020 RAV4 hybrid/PHEV), 0095-20 (firmware fix), T-SB-0007-21 (DC-DC ground). Adding for actionability.',
    fields: {
      description: 'The Suzuki Across is a Toyota RAV4 PHEV rebadge and inherits Toyota PHEV 12V auxiliary battery issues — slow drain from telematics + various BCM modules can leave a 12V dead after 7-14 days parked. Toyota issued specific TSBs: T-SB-0021-20 (covers 2020 RAV4 hybrid/PHEV), TSB 0095-20 (firmware update fixing repeat drain after replacement), T-SB-0007-21 (poor DC-DC ground connection). Toyota covers these under their TSB program even though the car sold as Suzuki.',
      solution: 'Request a Toyota or Suzuki dealer to apply TSB 0095-20 firmware update and verify DC-DC ground connection (T-SB-0007-21). Use a 12V battery maintainer for parked stretches over 1 week. AGM 12V replacement around £200-£300 at independent. Symptoms typically appear at 10,000-30,000 miles per Toyota field data.',
    },
  },
  {
    id: 'dacia-spring-12v-drain',
    note: 'Audit confirmed up to 80% 12V drain in a week (more severe than my draft). Also surfaced separate charger recall (1,700+ units, charger software bug preventing start). Strengthening with specifics and noting the recall is separate.',
    fields: {
      description: 'The Dacia Spring EV (built in China by Renault-Dongfeng JV) suffers significant 12V auxiliary battery drain during long parking — owners report up to 80% drain in a single week of inactivity, sometimes preventing the car from starting. Root cause is parasitic draw from a safety feature meant to preserve the 12V system in cold weather. Separately (not the same fix), Dacia issued a charger-related recall affecting 1,700+ Springs for a software bug that could trigger a dashboard alert and prevent start — confirm whether your VIN was included.',
      solution: 'Check recall status (Dacia.co.uk/recall-campaigns lists current actions). Update vehicle software at dealer. Use 12V maintainer if leaving parked over 1 week. Some owners report success with a simple battery isolator switch on the 12V negative for storage stretches over a month. AGM replacement €100-€180 + €30-€60 coding.',
      confidence: 'high',
    },
  },
];

const COL_MAP = {
  title: 'title', description: 'description', solution: 'solution',
  severity: 'severity', years: 'years', dtcCodes: '"dtcCodes"',
  confidence: 'confidence',
  estimatedCostLow: '"estimatedCostLow"', estimatedCostHigh: '"estimatedCostHigh"',
  typicalMileageLow: '"typicalMileageLow"', typicalMileageHigh: '"typicalMileageHigh"',
};

async function main() {
  console.log(`\n  EU Batch Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log(`  Target: ${UPDATES.length} entries (out of 42 audited)\n`);

  let applied = 0;
  for (const u of UPDATES) {
    const before = (await pool.query(`SELECT id, status FROM "KnownIssue" WHERE id = $1`, [u.id])).rows[0];
    if (!before) { console.log(`  ✗ ${u.id} — not found`); continue; }
    console.log(`  ${APPLY ? '✓' : '·'} ${u.id}  [${before.status}]`);
    console.log(`    note: ${u.note.slice(0, 180)}${u.note.length > 180 ? '...' : ''}`);

    if (APPLY) {
      const sets = []; const params = []; let i = 1;
      for (const [k, v] of Object.entries(u.fields)) {
        const col = COL_MAP[k]; if (!col) continue;
        params.push(v); sets.push(`${col} = $${i++}`);
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
