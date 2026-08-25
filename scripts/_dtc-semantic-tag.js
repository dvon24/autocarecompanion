#!/usr/bin/env node
/**
 * Semantic DTC tagging — assigns a code to an issue ONLY where the code's SAE
 * definition IS the condition the issue describes.
 *
 * This is deliberately narrow. The naive approach — map a component to a code
 * ("thermostat" -> P0128) — is wrong, because the FAILURE MODE decides the code,
 * not the part. A thermostat stuck open sets P0128; a cracked thermostat housing
 * leaking coolant sets nothing. A turbo running underboost sets P0299; a turbo
 * seeping oil sets nothing. Every rule below therefore gates on mode, and most
 * carry an `exclude` that removes the leak/mechanical-only variants.
 *
 * Rules never assign a cylinder-specific code (P0301..P0312). Nothing in the
 * catalog identifies WHICH cylinder, so only the generic P0300 is defensible.
 *
 * Every candidate code is also gated against the DTCCode library, so a rule can
 * never mint a page for a code the site cannot define.
 *
 * Dry run by default. --apply to write. Idempotent.
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/**
 * OBD-II became mandatory on US vehicles in MY1996 (EOBD later still in the EU).
 * A pre-1996 car has no standardised generic-code storage at all, so a rule that
 * puts P0562 on a Datsun 240Z is asserting something the vehicle physically
 * cannot do. Every rule is gated on the issue's newest affected model year.
 */
const OBD2_FIRST_YEAR = 1996;

/**
 * title     — must match the issue TITLE. The title is the issue's subject; the
 *             description and solution merely MENTION parts, which is how a Viper
 *             oil-consumption issue matched "catalytic converter" in early probes.
 * mode      — the failure mode that makes the code definitional. Checked against
 *             title + description so a title like "EGR Valve/Cooler Failure" can
 *             be confirmed from the body.
 * titleMode — same, but the mode must appear in the TITLE. Used where a body
 *             mention is too weak: "boost" in a description is usually incidental.
 * exclude   — disqualifiers, checked against the title. Usually the leak-only or
 *             wrong-domain variant of the same component, or a title that already
 *             names a DIFFERENT, more specific code for the same fault.
 */
const RULES = [
  // Only the generic P0300 is defensible — nothing in the catalog says which
  // cylinder. Issues that DO name a cylinder are a different fault: P0303 is
  // "cylinder 3", not "random/multiple", and the two have different diagnoses.
  { code: 'P0300', label: 'Random/Multiple Cylinder Misfire',
    title: /\bmisfir/i,
    exclude: /\bleak\b|oil consumption|\bP0[0-9A-F]{3}\b|cylinder\s*\d+\s*misfire/i },

  { code: 'P0101', label: 'MAF Circuit Range/Performance',
    title: /\b(mass air ?flow|MAF) sensor\b/i,
    mode: /fail|fault|dirty|contaminat|drift|erratic|limp/i,
    exclude: /post-MAF|air leak|coupler/i },

  { code: 'P0128', label: 'Coolant Thermostat Below Regulating Temp',
    title: /\bthermostat\b/i,
    mode: /stuck open|slow(ly)? warm|never reach(es)? (operating )?temp|below (operating )?temp|runs? cold/i,
    exclude: /housing|leak|crack/i },

  { code: 'P0380', label: 'Glow Plug/Heater Circuit A',
    title: /\bglow plug/i },

  // The DPF must be the SUBJECT. "Turbocharger failure driven by DPF
  // back-pressure" is a turbo issue that mentions the filter.
  { code: 'P2002', label: 'DPF Efficiency Below Threshold (Bank 1)',
    title: /\b(DPF|diesel particulate filter)\b/i,
    titleMode: /clog|block|saturat|regen|ash|efficien/i,
    exclude: /turbocharger/i },

  // Chain STRETCH exceeds the cam/crank correlation threshold and sets P0016.
  // A cold-start rattle from a tensioner bleeding down usually clears before the
  // monitor runs and stores nothing, so bare "rattle"/"noise" is not enough.
  { code: 'P0016', label: 'Crankshaft/Camshaft Position Correlation (Bank 1 Sensor A)',
    title: /\btiming chain\b/i,
    titleMode: /stretch|elongat|jump|skip/i,
    exclude: /cover|leak|seal\b/i },

  // P0420 was tried and REMOVED. After excluding the Bank 2 (P0430) titles, the
  // MINI cabin-air "Environmental Air Catalyst" sensor and the SCR/DEF systems,
  // it matched 2 issues and minted 0 new pages — no upside against the risk of
  // asserting a catalyst-efficiency fault on a manifold-crack issue.

  { code: 'P0401', label: 'EGR Flow Insufficient',
    title: /\bEGR\b|exhaust gas recirculation/i,
    titleMode: /clog|carbon|soot|stick|stuck|restrict|block/i,
    exclude: /cooler|coolant|leak|piston ring|\bP04[0-9A-F]{2}\b/i },

  // An EVAP purge PUMP (a leak-detection pump) is a different component from the
  // canister purge valve and does not set a purge-flow code, so it is not matched.
  { code: 'P0441', label: 'EVAP Purge Flow Incorrect',
    title: /\bpurge (valve|solenoid)\b/i,
    exclude: /leak|\bP0[0-9A-F]{3}\b|stuck open/i },

  // Stuck open is its own code — purge flow during a non-purge condition.
  { code: 'P0496', label: 'EVAP Flow During Non-Purge Condition',
    title: /\bpurge (valve|solenoid)\b/i,
    titleMode: /stuck open/i },

  // "Boost" alone is a trap: Buick's "Electronic Brake Boost Sensor" is a brake
  // booster. Underboost must be stated in the title, not inferred from a body
  // that merely says "limp mode".
  { code: 'P0299', label: 'Turbo/Supercharger Underboost',
    title: /\bturbo(charger)?\b|wastegate/i,
    titleMode: /underboost|under-boost|low boost|boost loss|loss of boost|no boost/i,
    exclude: /brake|oil (consumption|leak|feed|return|strainer)|recall/i },

  { code: 'P0562', label: 'System Voltage Low',
    title: /\balternator\b/i,
    mode: /fail|dead|no charg|undercharg|low voltage|warning light/i,
    exclude: /leak|pulley|belt|bracket|recall|service action|check VIN/i },
];

const clean = (s) => String(s).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

(async () => {
  const lib = new Set(
    (await prisma.dTCCode.findMany({ select: { code: true } })).map((c) => clean(c.code))
  );

  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { id: true, make: true, model: true, category: true, title: true, years: true,
              description: true, solution: true, symptoms: true, dtcCodes: true },
  });

  // Pages that already exist, so the new-page count is a true delta.
  const existingPages = new Set();
  for (const r of rows) for (const c of r.dtcCodes || []) {
    const cc = clean(c);
    if (lib.has(cc)) existingPages.add(cc + '|' + r.make);
  }

  const missingFromLib = RULES.filter((x) => !lib.has(x.code)).map((x) => x.code);

  const hits = new Map();      // ruleCode -> [rows]
  const writes = new Map();    // issueId -> {row, add:Set}
  const newPages = new Set();

  let skippedPreObd = 0;

  for (const r of rows) {
    const title = r.title || '';
    const body = `${title}\n${r.description || ''}`;
    const already = new Set((r.dtcCodes || []).map(clean));

    // A pre-OBD-II vehicle cannot store a generic P-code, whatever it broke.
    const newestYear = (r.years || []).length ? Math.max(...r.years) : null;
    const preObd = newestYear !== null && newestYear < OBD2_FIRST_YEAR;

    for (const rule of RULES) {
      if (!lib.has(rule.code)) continue;            // never mint an undefinable page
      if (already.has(rule.code)) continue;         // idempotent
      if (!rule.title.test(title)) continue;
      if (rule.exclude && rule.exclude.test(title)) continue;
      if (rule.mode && !rule.mode.test(body)) continue;
      if (rule.titleMode && !rule.titleMode.test(title)) continue;
      if (preObd) { skippedPreObd++; continue; }

      if (!hits.has(rule.code)) hits.set(rule.code, []);
      hits.get(rule.code).push(r);

      if (!writes.has(r.id)) writes.set(r.id, { row: r, add: new Set() });
      writes.get(r.id).add.add(rule.code);

      const pair = rule.code + '|' + r.make;
      if (!existingPages.has(pair)) newPages.add(pair);
    }
  }

  console.log(`mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  console.log(`published issues scanned: ${rows.length}`);
  if (missingFromLib.length) {
    console.log(`\n!! rules skipped — code absent from DTCCode library: ${missingFromLib.join(' ')}`);
  }
  console.log('\nmatches per rule:');
  for (const rule of RULES) {
    const n = (hits.get(rule.code) || []).length;
    console.log(`  ${rule.code}  ${String(n).padStart(4)}   ${rule.label}`);
  }
  console.log(`\nrule matches rejected as pre-OBD-II (<${OBD2_FIRST_YEAR}): ${skippedPreObd}`);
  console.log(`issue rows to update: ${writes.size}`);
  console.log(`NEW code x make pages: ${newPages.size}`);

  console.log('\n--- FULL MATCH LIST FOR REVIEW ---');
  for (const rule of RULES) {
    const m = hits.get(rule.code) || [];
    if (!m.length) continue;
    console.log(`\n### ${rule.code} — ${rule.label}  (${m.length})`);
    for (const r of m) {
      const pair = rule.code + '|' + r.make;
      const flag = existingPages.has(pair) ? '   ' : ' + ';
      console.log(`${flag}[${r.category}] ${r.make} ${r.model}: ${r.title}`);
      if (VERBOSE) console.log(`      ${(r.description || '').replace(/\s+/g, ' ').slice(0, 220)}`);
    }
  }

  if (!APPLY) {
    console.log('\n(dry run — nothing written. " + " marks a match that mints a NEW page.)');
  } else {
    // Written BEFORE the updates so a crash mid-run still leaves a record of
    // intent. This is an append, so the only way back is to remove exactly the
    // codes this run added — hence the manifest.
    const manifest = [...writes.values()].map(({ row, add }) => ({
      id: row.id, make: row.make, model: row.model, title: row.title,
      had: row.dtcCodes || [], added: [...add],
    }));
    const path = `data/_dtc-semantic-tag-applied.json`;
    require('fs').writeFileSync(path, JSON.stringify(manifest, null, 2));
    console.log(`\nreversal manifest: ${path}`);

    let n = 0;
    for (const { row, add } of writes.values()) {
      const merged = [...(row.dtcCodes || []), ...add];
      await prisma.knownIssue.update({ where: { id: row.id }, data: { dtcCodes: merged } });
      n++;
    }
    console.log(`updated ${n} rows.`);
  }
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
