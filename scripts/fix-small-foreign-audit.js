#!/usr/bin/env node
/**
 * Apply the May 18 batch audit findings for the 5 small foreign makes:
 * Fiat, Citroën, Peugeot, Mitsubishi, Renault (~114 issues combined).
 *
 * ARCHIVES (9): 5 fabricated + 4 wrong-vehicle majors
 *   Fabricated: Citroën C4 sphere, Citroën C3 sphere, Citroën Berlingo
 *     sliding door cable, Peugeot 508 GT air suspension, Renault Zoe
 *     motor mount vibration.
 *   Wrong vehicle: Fiat 500L BCM (the documented pattern is on 500
 *     hatch, not 500L — different BCMs), Mitsubishi Eclipse Cross PHEV
 *     (PHEV wasn't sold in North America at all), Renault Kadjar CVT
 *     (Kadjar uses EDC dual-clutch, not CVT), Renault Twizy motor
 *     bearing (the bearing issue is on the Zoe — Twizy uses a totally
 *     different drivetrain).
 *
 * UPDATES (8): targeted in-place corrections
 *   PSA/Stellantis PureTech 1.2 "timing chain" entries on Citroën C3,
 *   Peugeot 208, Peugeot 2008 are rewritten to the actual defect: WET
 *   TIMING BELT delamination. (Chain stretch was the older EP6 / Prince
 *   BMW-PSA engine, not PureTech.) Plus assorted DTC corrections, year
 *   range tightening, and the Mitsubishi Galant condenser vs compressor
 *   fix.
 *
 * Usage:
 *   node scripts/fix-small-foreign-audit.js              # dry-run
 *   node scripts/fix-small-foreign-audit.js --apply
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

const APPLY = process.argv.includes('--apply');

const ARCHIVE_IDS = [
  // ─── Citroën fabricated (3) ───
  'citroen-berlingo-sliding-door-cable',   // documented Berlingo door issues are latch/catch/roller, not cable
  'citroen-c4-suspension-sphere',          // C4 has conventional coil springs, hydropneumatic was on DS/CX/XM/C5
  'citroen-c3-suspension-sphere-leak',     // C3 1.4 (2002-2010) has torsion beam rear, not hydropneumatic
  // ─── Peugeot fabricated (1) ───
  'peugeot-508-air-suspension-failure-gt', // 508 GT has multi-link rear with Active Suspension Control (variable damping), not air suspension
  // ─── Renault fabricated (1) ───
  'renault-zoe-motor-mount-vibration',     // no documented systemic mount issue; real Zoe issues are bearings/brushes/HV battery
  // ─── Wrong-vehicle majors (4) ───
  'fiat-500l-bcm-electrical',              // documented BCM pattern is 500 hatch, not 500L (different platforms, different BCMs)
  'mitsubishi-eclipse-cross-phev-charging',// Eclipse Cross PHEV wasn't sold in North America at all
  'renault-kadjar-cvt-issues',             // Kadjar uses 7-speed EDC dual-clutch, not CVT
  'renault-twizy-drive-motor-bearing-and-gear-reduction-noise', // bearing issue is Zoe's; Twizy uses a totally different drivetrain
];

const UPDATES = [
  // ────────────────────────────────────────────────────────────────────
  // FIAT
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'fiat-500l-dct-shudder',
    note: 'DDCT was primarily 2014; only Pop trim retained it 2015-2016. 2017+ all 500L trims moved to Aisin torque-converter automatic, so DCT shudder doesn\'t apply to 2017-2020.',
    fields: {
      years: [2014, 2015, 2016],
      trims: ['Pop'],
    },
  },
  {
    id: 'fiat-500-multiair-actuator',
    note: 'P0014 + P1014 are wrong — P0014 is a generic VVT over-advanced code (usually low oil). Actual MultiAir-specific codes are P1065/P1067/P1069/P106B (cylinder-specific oil supply solenoid).',
    fields: {
      dtcCodes: ['P1065', 'P1067', 'P1069', 'P106B'],
    },
  },
  // ────────────────────────────────────────────────────────────────────
  // CITROËN — PureTech "timing chain" rewrite (it's a WET BELT)
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'citroen-c3-puretech-timing-chain',
    note: 'The actual defect on PSA/Stellantis PureTech 1.2 (EB2) is WET TIMING BELT delamination, not chain stretch. Chain stretch was the older EP6/Prince BMW-PSA engine. Renaming + rewriting.',
    fields: {
      title: 'PureTech 1.2 Wet Timing Belt Delamination',
      description: "PSA/Stellantis PureTech 1.2 (EB2) engines run an oil-immersed (\"wet\") timing belt instead of a chain. The belt's outer rubber layer can delaminate and shed particles into the oil pickup, clogging the strainer and starving the engine of oil. Stellantis revised the belt material and shortened the service interval (now 60,000 mi or 6 years, whichever first) but earlier-spec belts still in service are at risk.",
      dtcCodes: ['P0016', 'P0017', 'P0335'],
    },
  },
  {
    id: 'citroen-c3-power-steering-failure',
    note: 'DTC C1302 is wrong (brake pressure sensor/ABS code). Correct EPS codes are C1404 / C1414 / P0606.',
    fields: {
      dtcCodes: ['C1404', 'C1414', 'P0606'],
    },
  },
  // ────────────────────────────────────────────────────────────────────
  // PEUGEOT — same PureTech rewrite
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'peugeot-208-puretech-timing-chain',
    note: 'Same PureTech wet-belt issue as Citroën C3 — rewriting from "chain stretch" to "wet belt delamination".',
    fields: {
      title: 'PureTech 1.2 Wet Timing Belt Delamination',
      description: "The 208's PSA/Stellantis PureTech 1.2 (EB2) engine uses an oil-immersed (\"wet\") timing belt rather than a chain. The belt's outer rubber layer can delaminate over time, shedding particles into the oil that clog the pickup strainer and starve the engine of oil. Stellantis revised the belt material and shortened service intervals (now 60,000 mi or 6 years), but earlier-spec belts remain at risk. Often appears first as a rattle at startup followed by oil pressure warnings.",
      dtcCodes: ['P0016', 'P0017', 'P0335'],
    },
  },
  {
    id: 'peugeot-2008-puretech-timing-chain',
    note: 'Same PureTech wet-belt issue.',
    fields: {
      title: 'PureTech 1.2 Wet Timing Belt Delamination',
      description: "The 2008's PSA/Stellantis PureTech 1.2 (EB2) engine uses an oil-immersed (\"wet\") timing belt rather than a chain. The belt's outer rubber layer can delaminate over time, shedding particles into the oil that clog the pickup strainer and starve the engine of oil. Stellantis revised the belt material and shortened service intervals (now 60,000 mi or 6 years), but earlier-spec belts remain at risk.",
      dtcCodes: ['P0016', 'P0017', 'P0335'],
    },
  },
  // ────────────────────────────────────────────────────────────────────
  // MITSUBISHI
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'mitsubishi-galant-ac-compressor',
    note: 'Compressor isn\'t the documented common AC issue on 2004-2012 Galant — the CONDENSER is (multiple part revisions through mid-2010). Rewriting.',
    fields: {
      title: 'A/C Condenser Failure with Refrigerant Leak',
      description: "2004-2012 Galants suffer recurring A/C condenser failures — the OEM condenser had thin tube walls that develop pinhole leaks, especially in salt-belt climates where road salt accelerates corrosion. Mitsubishi released multiple part revisions through mid-2010 but failures continued. Symptoms: gradual loss of A/C cooling, oil residue around the condenser, low-side pressure too low on gauges. Replacement runs $400-$800 parts + 2-3 hours labor; aftermarket condensers (Denso, Spectra) work well.",
    },
  },
  {
    id: 'mitsubishi-galant-transmission-failure',
    note: 'V6 Galant (Sport V6, Ralliart) used a 5-speed Sportronic automatic, not a 4-speed. The 4-speed was paired with the 2.4L I4.',
    fields: {
      title: '4-Speed F4A4 / 5-Speed Sportronic Automatic Transmission Failure',
      description: "9th-gen Galant transmissions develop two distinct failure patterns: the 2.4L I4 cars use the F4A4 4-speed (torque converter clutch shudder, harsh shifts after ~100k miles) and the V6 Sport/Ralliart use the W5A51 5-speed Sportronic (3rd-gear clutch pack failure, solenoid issues). Both are repairable but expensive. Mitsubishi did not issue an extended warranty for either failure mode; the V6 5-speed failures are particularly costly due to less aftermarket support.",
    },
  },
  {
    id: 'mitsubishi-lancer-evo-transfer-case',
    note: 'ACD/transfer case issue is Evo VIII/IX/X only — not regular Lancer / Lancer ES / GTS (those don\'t have ACD).',
    fields: {
      trims: ['Evolution VIII', 'Evolution IX', 'Evolution X'],
      title: 'Evo VIII/IX/X Active Center Differential (ACD) Transfer Case Wear',
    },
  },
  // ────────────────────────────────────────────────────────────────────
  // RENAULT
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'renault-megane-timing-belt',
    note: 'Documented cause on K9K 1.5 dCi is timing belt rubbing against a misaligned fuel pump pulley, not crank seal oil contamination. Tightening years to dCi production window.',
    fields: {
      title: 'K9K 1.5 dCi Timing Belt Failure from Misaligned Fuel Pump Pulley',
      description: "Renault's K9K 1.5 dCi diesel engine is prone to premature timing belt failure caused by a misaligned high-pressure fuel pump pulley. The pulley's offset rubs the back of the belt, shredding it; when it breaks, the interference engine destroys valves and pistons. Renault revised the pulley design under TSB 04-040 and similar campaigns. Replacement belt + pulley kit runs €400-800 in parts; engine replacement after a snap costs €4,000-8,000.",
      years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
    },
  },
  {
    id: 'renault-captur-edc-transmission-shudder',
    note: 'Renault EDC (Getrag 6DCT250/DC4) in Captur is a WET dual-clutch, not dry. Original DTCs (P0841, P17xx) were generic. Removing wrong codes.',
    fields: {
      title: 'EDC 6DCT250 Wet Dual-Clutch Shudder and Jerky Engagement',
      description: "Captur's EDC (Getrag 6DCT250/DC4) is a wet dual-clutch transmission that develops shudder, hesitation, and jerky engagement after ~50-80k km. Common root causes: degraded clutch oil, worn clutch packs, and TCU software needing reflash. Renault released several software updates and revised oil specifications; symptoms often resolve after fluid service and reflash. Full clutch pack replacement runs €1,500-2,500.",
      dtcCodes: [],
    },
  },
  {
    id: 'renault-scenic-injector-leak-diesel',
    note: 'P0201/P0202 are injector electrical circuit codes, not seal leak codes. Removing wrong codes. Tightening years — Scenic ended ~2022.',
    fields: {
      title: 'dCi Diesel Injector Copper Washer Leak',
      description: "Renault's K9K and M9R dCi diesel engines used in Scenic II/III/IV develop weeping injector seals as the copper crush washers fatigue with heat cycling. Diesel sweats around the injector body, often coating the head with soot/oil mix and seeping toward the head gasket fire ring. Replacement washers are cheap (€2-5 each) but require careful torquing per Renault procedure; ignored leaks eventually cause cylinder head damage requiring decoke or head rebuild.",
      years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
      dtcCodes: [],
    },
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Small Foreign Makes Audit Fixes (${APPLY ? 'APPLY' : 'dry-run'})`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`━━━ Archive ${ARCHIVE_IDS.length} issues ━━━`);
  for (const id of ARCHIVE_IDS) {
    const r = (await pool.query(`SELECT id, make, title, status FROM "KnownIssue" WHERE id = $1`, [id])).rows[0];
    if (!r) { console.log(`  ✗ ${id} — not found`); continue; }
    if (r.status === 'archived') { console.log(`  ~ ${id} — already archived`); continue; }
    console.log(`  ${APPLY ? '✓' : '·'} [${r.make}] ${id}`);
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
      `SELECT id, make, title, years, severity, "dtcCodes", trims FROM "KnownIssue" WHERE id = $1`,
      [u.id],
    )).rows[0];
    if (!before) { console.log(`  ✗ ${u.id} — not found`); continue; }
    console.log(`\n  [${before.make}] ${u.id}`);
    console.log(`    note: ${u.note}`);
    for (const [k, v] of Object.entries(u.fields)) {
      const oldVal = before[k] === undefined ? 'undefined' : JSON.stringify(before[k]);
      const newVal = JSON.stringify(v);
      console.log(`    ${k}: ${oldVal.slice(0, 70)}${oldVal.length > 70 ? '...' : ''} → ${newVal.slice(0, 70)}${newVal.length > 70 ? '...' : ''}`);
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
