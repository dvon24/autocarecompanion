#!/usr/bin/env node
/**
 * Check PENDING_REVIEW rows against already-PUBLISHED ones for the same nameplate.
 *
 * scripts/_check-tonight-dupes.js scans published-vs-published, so it reports 0 for a freshly
 * persisted wave - the new rows are not published yet and it never sees them. That gap is the
 * whole reason this exists: the moment to catch a rediscovery is BEFORE promote, not after.
 *
 * Matching is token-overlap on the title (Jaccard over meaningful words) plus a shared-year
 * requirement, then printed for a human to judge. Deliberately noisy rather than automatic: last
 * wave's single "duplicate" was a false positive (two different N63 failures sharing the tokens
 * "N63 F01/F02 750i"), so this reports candidates and never deletes anything.
 *
 *   node scripts/_check-pending-dupes.js
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const THRESHOLD = 0.42;
const STOP = new Set(['the', 'and', 'for', 'from', 'with', 'this', 'that', 'can', 'may', 'causing', 'cause', 'causes', 'due', 'a', 'an', 'of', 'on', 'in', 'to', 'at', 'is', 'are', 'or', '其']);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const toks = (s) => new Set(
  String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
);

function jaccard(a, b) {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

(async () => {
  const pending = await prisma.knownIssue.findMany({
    where: { status: 'pending_review' },
    select: { id: true, make: true, model: true, title: true, years: true, vehicleType: true },
  });
  if (!pending.length) { console.log('no pending_review rows'); await prisma.$disconnect(); await pool.end(); return; }

  console.log(`checking ${pending.length} pending rows against published issues for the same nameplate\n`);

  let flagged = 0;
  for (const p of pending) {
    const published = await prisma.knownIssue.findMany({
      // Same nameplate AND same vehicle class - a car and a motorcycle sharing a make are not
      // candidates for duplication with each other.
      where: { make: p.make, model: p.model, status: 'published', vehicleType: p.vehicleType },
      select: { id: true, title: true, years: true },
    });
    const pt = toks(p.title);
    const py = new Set(p.years || []);
    for (const q of published) {
      const score = jaccard(pt, toks(q.title));
      if (score < THRESHOLD) continue;
      const sharesYear = (q.years || []).some((y) => py.has(y));
      if (!sharesYear) continue;
      flagged++;
      console.log(`[${score.toFixed(2)}] ${p.make} ${p.model}`);
      console.log(`   PENDING:   ${p.title}`);
      console.log(`   PUBLISHED: ${q.title}`);
      console.log(`   pending id: ${p.id}\n`);
    }
  }

  console.log(flagged ? `${flagged} candidate(s) — judge each by hand, most are false positives.` : 'No duplicate candidates found.');
  await prisma.$disconnect();
  await pool.end();
})();
