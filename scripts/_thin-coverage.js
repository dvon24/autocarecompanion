require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const POPULAR = ['Toyota','Honda','Ford','Chevrolet','Nissan','Hyundai','Kia','Subaru','Jeep','Dodge','Ram','GMC','Volkswagen','Mazda','Buick','Chrysler','Cadillac','Lincoln'];
(async () => {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT make, model, COUNT(*)::int n
      FROM "KnownIssue" WHERE status='published'
      GROUP BY make, model
      HAVING COUNT(*) BETWEEN 1 AND 4
      ORDER BY make, COUNT(*)`);
    const thin = rows.filter(r => POPULAR.includes(r.make));
    console.log(`Thin popular models (1-4 issues): ${thin.length}\n`);
    thin.forEach(r => console.log(`  ${String(r.make).padEnd(12)} ${String(r.model).padEnd(22)} ${r.n}`));
  } catch (e) { console.error('ERR', e.message); }
  finally { await prisma.$disconnect(); await pool.end(); }
})();
