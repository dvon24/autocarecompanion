#!/usr/bin/env node
/**
 * Persist the DTC tagging workflow's confirmed output onto KnownIssue.dtcCodes.
 *
 * Input is the `tagged` array from `_wf-dtc-tag-pass1.js`, saved to a JSON file.
 * Each entry is { id, make, model, title, codes[], reason }.
 *
 * The workflow already applied both gates (library membership, then adversarial semantic fit), so
 * this script does NOT re-judge. It re-checks only the things a script can check better than a
 * model, and refuses anything that fails:
 *
 *   - the issue still exists and is still published
 *   - make/model in the file match the row (a shifted id would otherwise tag the wrong car)
 *   - the code exists in the DTCCode library (re-checked: the library can change between runs, and
 *     a code we cannot define is a page we cannot render)
 *   - the issue covers a model year >= 1996 (pre-OBD-II cars cannot store a generic code)
 *   - no cylinder-specific code P0301-P0312 (nothing in the catalog identifies WHICH cylinder)
 *
 * Codes are MERGED into the existing array, never replaced, and de-duplicated. Idempotent: running
 * twice writes nothing the second time.
 *
 * Dry run by default. Pass --apply to write.
 *
 *   node scripts/_persist-dtc-tag-pass.js data/dtc-tag-pass1-2026-08-25.json
 *   node scripts/_persist-dtc-tag-pass.js data/dtc-tag-pass1-2026-08-25.json --apply
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const FILE = process.argv.find((a) => a.endsWith('.json'));
if (!FILE) {
  console.error('usage: node scripts/_persist-dtc-tag-pass.js <tagged.json> [--apply]');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const OBD2_FIRST_YEAR = 1996;
const CODE_RE = /^[PBCU][0-9A-F]{4}$/;
const CYLINDER_SPECIFIC = /^P03(0[1-9]|1[0-2])$/;

(async () => {
  const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  // Accept either the bare array or the workflow's { tagged: [...] } / { result: { tagged } } shape.
  const tagged = Array.isArray(raw) ? raw
    : Array.isArray(raw.tagged) ? raw.tagged
    : Array.isArray(raw.result && raw.result.tagged) ? raw.result.tagged
    : null;
  if (!tagged) {
    console.error('Could not find a `tagged` array in', FILE);
    process.exit(1);
  }

  const lib = new Set(
    (await prisma.dTCCode.findMany({ select: { code: true } })).map((r) => String(r.code).toUpperCase()),
  );
  console.log(`Input: ${tagged.length} tagged issues | library: ${lib.size} codes | mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);

  const rejects = { missing: 0, notPublished: 0, mismatch: 0, notInLib: 0, preObd: 0, cylinder: 0, badShape: 0 };
  const writes = [];
  let alreadyHad = 0;

  for (const t of tagged) {
    const row = await prisma.knownIssue.findUnique({
      where: { id: t.id },
      select: { id: true, make: true, model: true, status: true, years: true, dtcCodes: true, title: true },
    });
    if (!row) { rejects.missing++; continue; }
    if (row.status !== 'published') { rejects.notPublished++; continue; }
    if (row.make !== t.make || row.model !== t.model) { rejects.mismatch++; continue; }

    const years = Array.isArray(row.years) ? row.years.filter(Number.isFinite) : [];
    if (!years.length || Math.max(...years) < OBD2_FIRST_YEAR) { rejects.preObd++; continue; }

    const existing = new Set((Array.isArray(row.dtcCodes) ? row.dtcCodes : []).map((c) => String(c).toUpperCase()));
    const add = [];
    for (const c0 of (Array.isArray(t.codes) ? t.codes : [])) {
      const c = String(c0).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!CODE_RE.test(c)) { rejects.badShape++; continue; }
      if (CYLINDER_SPECIFIC.test(c)) { rejects.cylinder++; continue; }
      if (!lib.has(c)) { rejects.notInLib++; continue; }
      if (existing.has(c)) { alreadyHad++; continue; }
      if (!add.includes(c)) add.push(c);
    }
    if (!add.length) continue;
    writes.push({ id: row.id, make: row.make, model: row.model, title: row.title, add, next: [...existing, ...add].sort() });
  }

  const byMM = new Map();
  writes.forEach((w) => {
    const k = `${w.make} ${w.model}`;
    byMM.set(k, (byMM.get(k) || 0) + w.add.length);
  });
  [...byMM.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`  ${k.padEnd(26)} +${n} codes`));

  const totalCodes = writes.reduce((s, w) => s + w.add.length, 0);
  console.log(`\n${writes.length} issues would gain ${totalCodes} codes.`);
  console.log(`already present: ${alreadyHad} | rejected:`, rejects);

  // A code is only a NEW public page if this (code, make) pair does not already exist.
  const pairs = new Set();
  for (const w of writes) for (const c of w.add) pairs.add(`${c}|${w.make}`);
  let newPages = 0;
  for (const p of pairs) {
    const [code, make] = p.split('|');
    const n = await prisma.knownIssue.count({
      where: { make, status: 'published', dtcCodes: { has: code } },
    });
    if (n === 0) newPages++;
  }
  console.log(`New code x make pages this would mint: ${newPages} (of ${pairs.size} distinct pairs)`);

  if (!APPLY) {
    console.log('\nDRY RUN — nothing written. Re-run with --apply.');
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  // Sequential, not $transaction — the PrismaPg adapter does not support $transaction here.
  let done = 0;
  for (const w of writes) {
    await prisma.knownIssue.update({ where: { id: w.id }, data: { dtcCodes: w.next } });
    done++;
    if (done % 25 === 0) console.log(`  ...${done}/${writes.length}`);
  }
  console.log(`\nAPPLIED: ${done} issues updated, ${totalCodes} codes added.`);
  console.log('Remember: promote != deploy. Sitemap is build-time static — push to deploy the new pages.');
  await prisma.$disconnect();
  await pool.end();
})().catch(async (e) => {
  console.error('FAIL:', e.message);
  try { await prisma.$disconnect(); await pool.end(); } catch {}
  process.exit(1);
});
