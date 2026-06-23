require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }); pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', make: { equals: 'Dodge', mode: 'insensitive' } },
    select: { id: true, make: true, model: true, fixParts: true },
  });
  const items = [];
  let pnCount = 0;
  for (const r of rows) {
    const fp = Array.isArray(r.fixParts) ? r.fixParts : [];
    // Re-audit the parts WE added this session (reconciliation / propagation), with a real PN.
    const parts = fp.map((p, i) => ({ p, i }))
      .filter(({ p }) => p && p.oemPartNumber && (p.source === 'reconciliation' || p.source === 'propagation'))
      .map(({ p, i }) => ({ i, component: p.component, pn: p.oemPartNumber }));
    if (parts.length) { items.push({ id: r.id, vehicle: r.make + ' ' + r.model, parts }); pnCount += parts.length; }
  }
  fs.writeFileSync('data/_reaudit-dodge.json', JSON.stringify(items, null, 0));
  console.log('Dodge re-audit: ' + items.length + ' issues, ' + pnCount + ' PNs (reconciliation/propagation-sourced) → data/_reaudit-dodge.json');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
