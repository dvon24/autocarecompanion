require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  try {
    const totals = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int total,
        COUNT(*) FILTER (WHERE "fixParts" IS NOT NULL AND "fixParts"::text NOT IN ('[]','null'))::int withparts
      FROM "KnownIssue" WHERE status='published'`);
    const t = totals[0];
    console.log(`ALL published issues: ${t.total} | with fixParts: ${t.withparts} (${(100*t.withparts/t.total).toFixed(1)}%)\n`);
    const byMake = await prisma.$queryRawUnsafe(`
      SELECT make,
        COUNT(*)::int total,
        COUNT(*) FILTER (WHERE "fixParts" IS NOT NULL AND "fixParts"::text NOT IN ('[]','null'))::int withparts
      FROM "KnownIssue" WHERE status='published'
      GROUP BY make HAVING COUNT(*) >= 40
      ORDER BY COUNT(*) FILTER (WHERE "fixParts" IS NOT NULL AND "fixParts"::text NOT IN ('[]','null')) DESC`);
    console.log('By make (>=40 issues), sorted by fixParts coverage:');
    for (const m of byMake) {
      const pct = t.total ? (100*m.withparts/m.total).toFixed(0) : 0;
      console.log(`  ${String(m.make).padEnd(16)} ${String(m.withparts).padStart(4)}/${String(m.total).padStart(4)}  ${String(pct).padStart(3)}%`);
    }
  } catch (e) { console.error('ERR', e.message); }
  finally { await prisma.$disconnect(); await pool.end(); }
})();
