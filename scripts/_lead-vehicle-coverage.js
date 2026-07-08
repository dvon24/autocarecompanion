require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  const leads = await prisma.interestEmail.findMany({ select: { context: true } });
  const set = new Set();
  for (const r of leads) {
    const m = String(r.context || '').replace(/^known-issues:/, '').replace(/^"|"$/g, '').trim();
    if (m) set.add(m);
  }
  console.log(`Distinct lead vehicles: ${set.size}\n`);
  const rows = await prisma.$queryRawUnsafe(`
    SELECT make||' '||model AS v, COUNT(*)::int n, MAX("createdAt") AS newest,
      COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '10 days')::int recent
    FROM "KnownIssue" WHERE status='published' GROUP BY make, model`);
  const byV = new Map(rows.map(r => [String(r.v).toLowerCase(), r]));
  for (const v of [...set].sort()) {
    const r = byV.get(v.toLowerCase());
    if (r) console.log(`  ${v.padEnd(26)} ${String(r.n).padStart(3)} issues  newest ${r.newest.toISOString().slice(0,10)}  (+${r.recent} last 10d)`);
    else console.log(`  ${v.padEnd(26)} — NONE`);
  }
  await prisma.$disconnect(); await pool.end();
})();
