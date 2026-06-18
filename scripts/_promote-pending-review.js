#!/usr/bin/env node
/**
 * Bulk-promote ALL status='pending_review' KnownIssue rows to 'published'.
 * Mirrors scripts/promote-issue.js per-row logic in one process:
 *   - HEAD/GET liveness-checks each citation URL (free, ZERO AI calls)
 *   - promotes rows where live >= dead; SKIPS (leaves pending_review) rows
 *     with more dead than live citations and reports them for manual review.
 *
 * Usage:
 *   node scripts/_promote-pending-review.js              # promote all that pass the URL gate
 *   node scripts/_promote-pending-review.js --make Ford  # only this make
 *   node scripts/_promote-pending-review.js --dry-run    # report only, no writes
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const makeFilter = args.includes('--make') ? args[args.indexOf('--make') + 1] : null;
const HEAD_TIMEOUT_MS = 10_000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function isUrlLive(url) {
  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) return false;
  const attempt = async (method) => {
    try {
      const r = await fetch(url, {
        method, redirect: 'follow', signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
        headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.5' },
      });
      if (r.status >= 200 && r.status < 400) return true;     // live
      if (r.status === 401 || r.status === 403) return true;  // bot-blocked but real
      if (r.status >= 500) return true;                       // transient
      return false;                                           // 404/410/etc
    } catch { return false; }
  };
  if (await attempt('HEAD')) return true;
  return attempt('GET');
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const where = { status: 'pending_review' };
  if (makeFilter) where.make = makeFilter;
  const rows = await prisma.knownIssue.findMany({
    where, select: { id: true, title: true, make: true, model: true, citations: true },
    orderBy: [{ make: 'asc' }, { model: 'asc' }],
  });
  console.log(`Found ${rows.length} pending_review issues${makeFilter ? ` for ${makeFilter}` : ''}.${dryRun ? ' (dry-run)' : ''}\n`);

  let promoted = 0, skipped = 0;
  const skippedList = [];

  for (const issue of rows) {
    const cites = Array.isArray(issue.citations) ? issue.citations : [];
    let live = 0, dead = 0;
    const deadUrls = [];
    if (cites.length > 0) {
      const results = await Promise.all(cites.map(async (c) => (c?.url ? { url: c.url, live: await isUrlLive(c.url) } : { url: null, live: true })));
      for (const r of results) { if (r.live) live++; else { dead++; deadUrls.push(r.url); } }
    }
    if (dead > live) {
      skipped++;
      skippedList.push({ id: issue.id, dead: deadUrls });
      console.log(`⊘ SKIP (${dead} dead / ${live} live): ${issue.make} ${issue.model} — ${issue.title.slice(0, 60)}`);
      continue;
    }
    if (!dryRun) {
      await prisma.knownIssue.update({
        where: { id: issue.id },
        data: { status: 'published', humanApproved: true, reviewedOn: new Date().toISOString().slice(0, 10), updatedAt: new Date() },
      });
    }
    promoted++;
    console.log(`✓ ${dryRun ? 'would publish' : 'PUBLISHED'}: ${issue.make} ${issue.model} — ${issue.title.slice(0, 60)} (${live} live/${dead} dead)`);
  }

  console.log(`\n━━━ ${dryRun ? 'Dry-run' : 'Promotion'} complete ━━━`);
  console.log(`  ${dryRun ? 'Would publish' : 'Published'}: ${promoted}`);
  console.log(`  Skipped (dead-URL gate, left pending_review): ${skipped}`);
  if (skippedList.length) {
    console.log('\nSkipped for manual review:');
    skippedList.forEach((s) => { console.log(`  - ${s.id}`); s.dead.forEach((u) => console.log(`      × ${u}`)); });
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); process.exit(1); });
