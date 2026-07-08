require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  try {
    const total = await prisma.vehiclePartLookup.count();
    const verified = await prisma.vehiclePartLookup.count({ where: { status: 'verified' } });
    const byMake = await prisma.vehiclePartLookup.groupBy({ by: ['make'], _count: { _all: true } });
    const dv = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS n FROM (SELECT DISTINCT make, model FROM "VehiclePartLookup") t`);
    const byTask = await prisma.vehiclePartLookup.groupBy({ by: ['task'], _count: { _all: true } });
    console.log('TOTAL rows:', total, '| verified:', verified, '| distinct make+model:', dv[0].n);
    console.log('\nBy make:');
    byMake.sort((a,b)=>b._count._all-a._count._all).forEach(m => console.log('  ', String(m.make).padEnd(16), m._count._all));
    console.log('\nTasks:');
    byTask.sort((a,b)=>b._count._all-a._count._all).slice(0,24).forEach(t => console.log('  ', String(t.task).padEnd(26), t._count._all));
  } catch (e) { console.error('ERR', e.message); }
  finally { await prisma.$disconnect(); await pool.end(); }
})();
