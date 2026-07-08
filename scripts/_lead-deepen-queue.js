require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  const leads = await prisma.interestEmail.findMany({ select: { context: true, lastNotifiedAt: true } });
  // distinct vehicle -> { leadCount, neverNotified }
  const veh = new Map();
  for (const r of leads) {
    const m = String(r.context || '').replace(/^known-issues:/, '').replace(/^"|"$/g, '').trim();
    if (!m) continue;
    const cur = veh.get(m) || { leads: 0, never: 0 };
    cur.leads++; if (!r.lastNotifiedAt) cur.never++;
    veh.set(m, cur);
  }
  const queue = [];
  for (const [v, info] of veh) {
    // split "Make Model" — make is first token(s); match by trying known makes
    const rows = await prisma.$queryRawUnsafe(
      `SELECT make, model, title, "reportCount" FROM "KnownIssue" WHERE status='published' AND (make||' '||model) ILIKE $1 ORDER BY "reportCount" DESC`, v);
    if (rows.length === 0) { queue.push({ v, make: null, model: null, count: 0, ...info, titles: [] }); continue; }
    queue.push({ v, make: rows[0].make, model: rows[0].model, count: rows.length, ...info, titles: rows.map(r => r.title).slice(0, 30) });
  }
  // priority: never-notified leads first, then thin coverage, then lead count
  queue.sort((a,b) => (b.never - a.never) || (a.count - b.count) || (b.leads - a.leads));
  fs.writeFileSync('scripts/_lead-deepen-data.json', JSON.stringify(queue, null, 2));
  console.log('vehicle'.padEnd(26), 'iss', 'leads', 'never');
  queue.forEach(q => console.log(`  ${q.v.padEnd(26)} ${String(q.count).padStart(3)}  ${String(q.leads).padStart(3)}  ${String(q.never).padStart(3)}`));
  console.log(`\nWrote scripts/_lead-deepen-data.json (${queue.length} vehicles)`);
  await prisma.$disconnect(); await pool.end();
})();
