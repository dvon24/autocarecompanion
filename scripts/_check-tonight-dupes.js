#!/usr/bin/env node
/* eslint-disable */
/**
 * Read-only: find tonight's published issues that look like duplicates of
 * OLDER issues on the same make+model (token-overlap on title + same
 * category, or strong symptom overlap). Prints suspect pairs for review.
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const STOP = new Set(['the','a','an','and','or','of','in','on','at','for','with','from','to','failure','failures','issue','issues','problem','problems','may','can','recall','premature','system']);
function tokens(title) {
  return new Set(
    String(title).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}
function overlap(a, b) {
  const inter = [...a].filter((t) => b.has(t)).length;
  return inter / Math.max(1, Math.min(a.size, b.size));
}

(async () => {
  const since = new Date();
  since.setHours(since.getHours() - 12);
  const fresh = await prisma.knownIssue.findMany({
    where: { createdAt: { gte: since }, status: 'published' },
    select: { id: true, make: true, model: true, title: true, category: true, years: true, citations: true },
  });
  console.log(`Tonight's published issues: ${fresh.length}\n`);

  const pairs = [];
  const keys = [...new Set(fresh.map((f) => `${f.make}|||${f.model}`))];
  for (const key of keys) {
    const [make, model] = key.split('|||');
    const older = await prisma.knownIssue.findMany({
      where: {
        make, model, status: 'published',
        createdAt: { lt: since },
      },
      select: { id: true, title: true, category: true, years: true, reportCount: true },
    });
    for (const f of fresh.filter((x) => x.make === make && x.model === model)) {
      const ft = tokens(f.title);
      for (const o of older) {
        const ov = overlap(ft, tokens(o.title));
        const yearOverlap = f.years.some((y) => o.years.includes(y));
        if ((ov >= 0.5 && f.category === o.category && yearOverlap) || ov >= 0.75) {
          pairs.push({ make, model, fresh: f, old: o, overlap: ov });
        }
      }
    }
  }

  if (!pairs.length) { console.log('No suspect duplicates found.'); }
  for (const p of pairs) {
    console.log(`SUSPECT ${p.make} ${p.model} (overlap ${p.overlap.toFixed(2)}):`);
    console.log(`  NEW: ${p.fresh.id} — "${p.fresh.title}" [${p.fresh.category}] (${Math.min(...p.fresh.years)}-${Math.max(...p.fresh.years)})`);
    console.log(`  OLD: ${p.old.id} — "${p.old.title}" [${p.old.category}] (${p.old.years.length ? Math.min(...p.old.years) + '-' + Math.max(...p.old.years) : '?'}) reports=${p.old.reportCount}\n`);
  }
  await prisma.$disconnect();
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
