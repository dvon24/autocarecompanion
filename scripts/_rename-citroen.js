#!/usr/bin/env node
/**
 * One-shot rename: Citroën → Citroen everywhere.
 *
 * Why: the ë diacritic was producing slug-handling complications and
 * broke a redirect in next.config.ts that blocked all production deploys
 * for 3 days. Simpler to use plain "Citroen" in our data — the brand is
 * routinely spelled both ways in English-speaking markets.
 *
 * Updates:
 *   1. public/data/ymmt.json — recursively renames the "Citroën" key
 *      to "Citroen" in every year bucket.
 *   2. KnownIssue.make = 'Citroën' rows in Postgres → 'Citroen'.
 *
 * Safe to re-run (idempotent — no rows match the predicate the second time).
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  // ── 1. ymmt.json ──────────────────────────────────────────────────
  const ymmtPath = path.join(process.cwd(), 'public', 'data', 'ymmt.json');
  const raw = fs.readFileSync(ymmtPath, 'utf-8');
  const ymmt = JSON.parse(raw);

  let yearsTouched = 0;
  for (const year of Object.keys(ymmt)) {
    const makes = ymmt[year];
    if (makes && Object.prototype.hasOwnProperty.call(makes, 'Citroën')) {
      // Rename key in place while preserving overall key order.
      const reordered = {};
      for (const m of Object.keys(makes)) {
        if (m === 'Citroën') {
          reordered['Citroen'] = makes[m];
        } else {
          reordered[m] = makes[m];
        }
      }
      ymmt[year] = reordered;
      yearsTouched += 1;
    }
  }
  fs.writeFileSync(ymmtPath, JSON.stringify(ymmt, null, 2));
  console.log(`ymmt.json — Citroën → Citroen in ${yearsTouched} year buckets`);

  // ── 2. KnownIssue DB rows ────────────────────────────────────────
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const updated = await prisma.knownIssue.updateMany({
    where: { make: 'Citroën' },
    data: { make: 'Citroen' },
  });
  console.log(`KnownIssue — ${updated.count} rows updated`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
