require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const MODELS = [['Ford','F-150'],['Chevrolet','Silverado 1500'],['Jeep','Grand Cherokee'],['Toyota','Camry']];
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }); pool.on('error', () => {});
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const since = new Date(Date.now() - 3 * 60 * 60 * 1000); // last 3h = this session's deepen adds
  const items = []; let pnCount = 0;
  for (const [mk, md] of MODELS) {
    const rows = await prisma.knownIssue.findMany({
      where: { status: 'published', make: { equals: mk, mode: 'insensitive' }, model: { equals: md, mode: 'insensitive' }, createdAt: { gt: since } },
      select: { id: true, make: true, model: true, fixParts: true },
    });
    for (const r of rows) {
      const fp = Array.isArray(r.fixParts) ? r.fixParts : [];
      const parts = fp.map((p, i) => ({ p, i })).filter(({ p }) => p && p.oemPartNumber).map(({ p, i }) => ({ i, component: p.component, pn: p.oemPartNumber }));
      if (parts.length) { items.push({ id: r.id, vehicle: r.make + ' ' + r.model, parts }); pnCount += parts.length; }
    }
  }
  fs.writeFileSync('data/_reaudit-deepen.json', JSON.stringify(items, null, 0));
  console.log('Deepen re-audit: ' + items.length + ' new issues, ' + pnCount + ' PNs -> data/_reaudit-deepen.json');
  await prisma.$disconnect(); await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
