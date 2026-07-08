require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  try {
    const total = await prisma.vehicle.count();
    console.log('Total registered garage vehicles:', total);
    if (total > 0) {
      const byMake = await prisma.$queryRawUnsafe(`SELECT make, COUNT(*)::int n FROM "Vehicle" GROUP BY make ORDER BY COUNT(*) DESC LIMIT 25`);
      console.log('\nRegistered vehicles by make (where taps will happen):');
      byMake.forEach(m => console.log('  ', String(m.make).padEnd(16), m.n));
    }
  } catch (e) { console.error('ERR', e.message); }
  finally { await prisma.$disconnect(); await pool.end(); }
})();
