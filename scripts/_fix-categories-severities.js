#!/usr/bin/env node
/**
 * One-time data repair (2026-06-11 incident): KnownIssue rows written by the
 * workflow persist pipeline used a 21-value category list, but the UI's
 * categoryConfig knows 17. Unknown categories crash the article page
 * server-side (categoryConfig[cat].icon TypeError) — the page streams its
 * shell (200 + title) then dies, so affected models render ZERO issues.
 * Also: severity 'critical' is outside the UI enum (high/medium/low) and
 * those issues are invisible in the article issues list.
 *
 * Remaps (all statuses, matching src/lib/known-issues.ts conventions):
 *   fuel-system  -> fuel
 *   electronics  -> electrical
 *   ignition     -> engine
 *   wheels-tires -> suspension
 *   critical     -> high   (matches normalizeSeverity)
 *
 * Idempotent. Run with --dry-run to preview.
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const DRY = process.argv.includes('--dry-run');
const CATEGORY_FIXES = {
  'fuel-system': 'fuel',
  electronics: 'electrical',
  ignition: 'engine',
  'wheels-tires': 'suspension',
};

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  for (const [from, to] of Object.entries(CATEGORY_FIXES)) {
    const n = await prisma.knownIssue.count({ where: { category: from } });
    if (DRY) { console.log(`[dry] category ${from} -> ${to}: ${n} rows`); continue; }
    const r = await prisma.knownIssue.updateMany({ where: { category: from }, data: { category: to } });
    console.log(`category ${from} -> ${to}: ${r.count} rows`);
  }

  const nSev = await prisma.knownIssue.count({ where: { severity: 'critical' } });
  if (DRY) {
    console.log(`[dry] severity critical -> high: ${nSev} rows`);
  } else {
    const r = await prisma.knownIssue.updateMany({ where: { severity: 'critical' }, data: { severity: 'high' } });
    console.log(`severity critical -> high: ${r.count} rows`);
  }

  await prisma.$disconnect();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
