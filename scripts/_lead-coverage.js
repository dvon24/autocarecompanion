// Coverage audit: for every vehicle a lead asked to be alerted about, how much
// catalog do we actually have to send them? Emits a gap-ranked worklist.
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});
const p = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const leads = await p.interestEmail.findMany({
    where: { unsubscribedAt: null, context: { startsWith: 'known-issues:' } },
    select: { context: true },
  });
  const demand = {};
  for (const l of leads) {
    const v = l.context.slice('known-issues:'.length).trim();
    demand[v] = (demand[v] || 0) + 1;
  }

  const issues = await p.knownIssue.findMany({
    where: { vehicleType: 'car' },
    select: { make: true, model: true, status: true, dtcCodes: true, fixParts: true },
  });
  const cat = {};
  for (const i of issues) {
    const k = `${i.make} ${i.model}`.toLowerCase();
    const c = (cat[k] = cat[k] || { pub: 0, pend: 0, dtc: 0, parts: 0 });
    if (i.status === 'published') {
      c.pub++;
      if (i.dtcCodes && i.dtcCodes.length) c.dtc++;
      if (Array.isArray(i.fixParts) && i.fixParts.length) c.parts++;
    } else c.pend++;
  }

  const rows = Object.entries(demand).map(([v, n]) => {
    const c = cat[v.toLowerCase()] || { pub: 0, pend: 0, dtc: 0, parts: 0 };
    return { vehicle: v, leads: n, ...c };
  });
  rows.sort((a, b) => a.pub - b.pub || b.leads - a.leads);

  const zero = rows.filter((r) => r.pub === 0);
  const thin = rows.filter((r) => r.pub > 0 && r.pub < 5);
  console.log(`distinct lead vehicles: ${rows.length} | leads: ${leads.length}`);
  console.log(`ZERO published: ${zero.length} vehicles / ${zero.reduce((s, r) => s + r.leads, 0)} leads`);
  console.log(`THIN (1-4):     ${thin.length} vehicles / ${thin.reduce((s, r) => s + r.leads, 0)} leads`);
  console.log('\nleads  pub  pend  dtc  parts  vehicle');
  for (const r of rows) {
    console.log(
      String(r.leads).padStart(5), String(r.pub).padStart(4), String(r.pend).padStart(5),
      String(r.dtc).padStart(4), String(r.parts).padStart(6), ' ' + r.vehicle
    );
  }
  require('fs').writeFileSync('data/_lead-coverage.json', JSON.stringify(rows, null, 2));
  await p.$disconnect(); await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
