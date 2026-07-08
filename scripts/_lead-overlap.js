require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const DEEPENED = ['soul','forte','stinger','juke','gt-r','fj cruiser','c-hr','rx-8','renegade','sonic','volt','accent','f-150 lightning','terrain'];
(async () => {
  const total = await prisma.interestEmail.count();
  const rows = await prisma.interestEmail.findMany({ select: { email: true, context: true, lastNotifiedAt: true } });
  console.log(`Total interest-email leads: ${total}\n`);
  let overlap = 0;
  for (const r of rows) {
    const ctx = r.context || {};
    const blob = JSON.stringify(ctx).toLowerCase();
    const hit = DEEPENED.find(m => blob.includes(m));
    const label = ctx.make || ctx.model ? `${ctx.make||''} ${ctx.model||''}`.trim() : (ctx.slug || ctx.vehicle || JSON.stringify(ctx).slice(0,80));
    console.log(`  ${hit ? '★' : ' '} ${String(label).padEnd(38)} <${r.email}> ${r.lastNotifiedAt ? 'notified '+r.lastNotifiedAt.toISOString().slice(0,10) : 'never notified'}`);
    if (hit) overlap++;
  }
  console.log(`\nLeads matching a deepened model: ${overlap}`);
  await prisma.$disconnect(); await pool.end();
})();
