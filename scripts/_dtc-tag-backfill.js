#!/usr/bin/env node
/**
 * DTC tag backfill — repairs and extends KnownIssue.dtcCodes[].
 *
 * /known-issues/dtc/[code]/[make] pages only exist where a published issue
 * carries that code in dtcCodes[] AND the code exists in the DTCCode library.
 * Codes stored in ISO 15031-6 extended form ("P030100" = P0301 + failure-type
 * byte 00) never match, so those pages were silently never minted.
 *
 * Three operations, each independently gated and all provably safe — no code is
 * ever invented, only normalized, dropped, or lifted out of the issue's own prose:
 *   1. NORMALIZE  7-char ISO codes down to their 5-char base
 *   2. STRIP      malformed fragments (bare 2-digit numbers)
 *   3. EXTRACT    codes written in title/description/solution but never tagged
 *
 * Run with no flags for a dry run. --apply to write.
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const WELL_FORMED = /^[PBCU][0-3][0-9A-F]{3}$/;
const ISO_EXTENDED = /^[PBCU][0-3][0-9A-F]{3}[0-9A-F]{2}$/;
const PROSE_RE = /\b([PBCU][0-3][0-9A-F]{3})\b/gi;

function clean(raw) {
  return String(raw).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
}

/** @returns {{code:string|null, op:'keep'|'normalize'|'strip'}} */
function classify(raw) {
  const c = clean(raw);
  if (WELL_FORMED.test(c)) return { code: c, op: 'keep' };
  if (ISO_EXTENDED.test(c)) return { code: c.slice(0, 5), op: 'normalize' };
  // Bare numeric fragments ("31", "42") carry no recoverable code.
  if (/^\d{1,3}$/.test(c)) return { code: null, op: 'strip' };
  // Manufacturer hex (BMW 2E81, VAG 01435) is a different namespace, not
  // OBD-II. Left untouched deliberately — see the report.
  return { code: c, op: 'keep' };
}

(async () => {
  const lib = new Set(
    (await prisma.dTCCode.findMany({ select: { code: true } })).map((c) => c.code.toUpperCase().trim())
  );

  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { id: true, make: true, model: true, title: true, description: true,
              solution: true, symptoms: true, dtcCodes: true },
  });

  const stats = { normalized: 0, stripped: 0, extracted: 0, rowsChanged: 0 };
  const notInLibrary = new Map();   // well-formed but absent from DTCCode
  const newPages = new Set();
  const existingPages = new Set();
  for (const r of rows) for (const c of r.dtcCodes || []) {
    const { code } = classify(c);
    if (code && lib.has(code)) existingPages.add(code + '|' + r.make);
  }

  const writes = [];
  for (const r of rows) {
    const out = [];
    const seen = new Set();
    let changed = false;

    for (const raw of r.dtcCodes || []) {
      const { code, op } = classify(raw);
      if (op === 'strip') { stats.stripped++; changed = true; continue; }
      if (op === 'normalize') { stats.normalized++; changed = true; }
      if (code && !seen.has(code)) { seen.add(code); out.push(code); }
      else if (code) changed = true; // de-duplicated
    }

    const hay = [r.title, r.description, r.solution, ...(r.symptoms || [])].join(' \n ');
    for (const m of hay.matchAll(PROSE_RE)) {
      const code = m[1].toUpperCase();
      if (!lib.has(code) || seen.has(code)) continue;  // never invent: library-gated
      seen.add(code); out.push(code);
      stats.extracted++; changed = true;
    }

    for (const c of out) {
      if (!lib.has(c)) { notInLibrary.set(c, (notInLibrary.get(c) || 0) + 1); continue; }
      const pair = c + '|' + r.make;
      if (!existingPages.has(pair)) newPages.add(pair);
    }

    if (changed) { stats.rowsChanged++; writes.push({ id: r.id, dtcCodes: out }); }
  }

  console.log(`mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);
  console.log(`published issues scanned: ${rows.length}`);
  console.log(`  codes normalized (ISO 7-char -> base): ${stats.normalized}`);
  console.log(`  malformed fragments stripped:          ${stats.stripped}`);
  console.log(`  codes extracted from prose:            ${stats.extracted}`);
  console.log(`  issue rows to update:                  ${stats.rowsChanged}`);
  console.log(`NEW code x make pages minted:            ${newPages.size}`);
  console.log(`\nwell-formed codes still absent from the DTC library: ${notInLibrary.size}`);
  console.log([...notInLibrary.keys()].sort().join(' '));

  if (!APPLY) { console.log('\n(dry run — pass --apply to write)'); }
  else {
    let n = 0;
    for (const w of writes) {
      await prisma.knownIssue.update({ where: { id: w.id }, data: { dtcCodes: w.dtcCodes } });
      if (++n % 25 === 0) process.stdout.write(`  ${n}/${writes.length}\r`);
    }
    console.log(`\nupdated ${n} rows.`);
  }
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
